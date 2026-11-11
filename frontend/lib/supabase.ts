import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, UserRole } from '../types';
import { verifyPassword, hashPassword } from './security';

const env = ((import.meta as any).env || {}) as Record<string, string | undefined>;
const supabaseUrl = (env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface SupabaseAuthResult {
  success: boolean;
  message: string;
  user?: User;
  fromSupabase: boolean;
}

/**
 * Tra cứu và đối chiếu tài khoản & Role trực tiếp trên các bảng ERD của Supabase:
 * - QUAN_TRI_VIEN (Admin)
 * - CHU_TRO (Landlord)
 * - NGUOI_THUE (Tenant)
 * - PROFILES (Bảng tổng hợp tương thích)
 */
export async function verifyUserWithSupabase(
  identifier: string,
  enteredPassword?: string,
  requiredRole?: UserRole
): Promise<SupabaseAuthResult | null> {
  if (!supabase) {
    return null; // Supabase chưa cấu hình biến môi trường
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPhone = identifier.trim().replace(/\s+/g, '');

  try {
    // 1. Thử tìm trên bảng QUAN_TRI_VIEN
    if (!requiredRole || requiredRole === 'admin') {
      const { data: qtvList } = await supabase
        .from('quan_tri_vien')
        .select('*')
        .or(`email.ilike.${cleanId},sdt.eq.${cleanPhone},cccd.eq.${cleanId}`)
        .limit(1);

      if (qtvList && qtvList.length > 0) {
        return await mapAndValidateUser(qtvList[0], 'admin', enteredPassword);
      }
    }

    // 2. Thử tìm trên bảng CHU_TRO
    if (!requiredRole || requiredRole === 'landlord') {
      const { data: chuTroList } = await supabase
        .from('chu_tro')
        .select('*')
        .or(`email.ilike.${cleanId},sdt.eq.${cleanPhone},cccd.eq.${cleanId},host_code.ilike.${cleanId}`)
        .limit(1);

      if (chuTroList && chuTroList.length > 0) {
        return await mapAndValidateUser(chuTroList[0], 'landlord', enteredPassword);
      }
    }

    // 3. Thử tìm trên bảng NGUOI_THUE
    if (!requiredRole || requiredRole === 'tenant') {
      const { data: nguoiThueList } = await supabase
        .from('nguoi_thue')
        .select('*')
        .or(`email.ilike.${cleanId},sdt.eq.${cleanPhone},cccd.eq.${cleanId}`)
        .limit(1);

      if (nguoiThueList && nguoiThueList.length > 0) {
        return await mapAndValidateUser(nguoiThueList[0], 'tenant', enteredPassword);
      }
    }

    // 4. Tìm trên bảng PROFILES (bảng tổng hợp fallback)
    const { data: profileList, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.ilike.${cleanId},phone.eq.${cleanPhone},id_card.eq.${cleanId},name.ilike.%${cleanId}%,host_code.ilike.${cleanId}`)
      .limit(5);

    if (!profileError && profileList && profileList.length > 0) {
      const matched = profileList.find(
        (p) =>
          (p.email && p.email.toLowerCase() === cleanId) ||
          (p.phone && p.phone.replace(/\s+/g, '') === cleanPhone) ||
          (p.id_card && p.id_card === cleanId)
      ) || profileList[0];

      return await mapAndValidateUser(matched, matched.role as UserRole, enteredPassword);
    }

    return {
      success: false,
      message: 'Tài khoản không tìm thấy trên CSDL Supabase!',
      fromSupabase: true,
    };
  } catch (error: any) {
    console.error('Lỗi khi đối chiếu Supabase:', error);
    return null;
  }
}

/**
 * Kiểm tra và ép kiểu role chuẩn xác từ bản ghi CSDL Supabase
 */
async function mapAndValidateUser(
  dbRecord: any,
  roleHint: UserRole,
  enteredPassword?: string
): Promise<SupabaseAuthResult> {
  const actualRole: UserRole = (dbRecord.vai_tro || dbRecord.role || roleHint) as UserRole;

  // Kiểm tra khóa tài khoản
  const status = dbRecord.trang_thai || dbRecord.status || 'active';
  if (status === 'locked' || status === 'khoa') {
    return {
      success: false,
      message: 'Tài khoản này đang bị KHÓA trên CSDL Supabase!',
      fromSupabase: true,
    };
  }

  // 1. Kiểm tra mật khẩu tài khoản nếu có lưu password_hash trên Supabase
  const storedHash = dbRecord.password_hash || dbRecord.passwordHash;
  if (enteredPassword) {
    if (storedHash) {
      const isPwValid = await verifyPassword(enteredPassword, storedHash);
      if (!isPwValid) {
        return {
          success: false,
          message: 'Mật khẩu đăng nhập không chính xác trên CSDL Supabase!',
          fromSupabase: true,
        };
      }
    } else {
      // Trường hợp mật khẩu ban đầu chưa băm
      console.warn('Tài khoản chưa có password_hash trên Supabase.');
    }
  }

  const mappedUser: User = {
    id: String(dbRecord.ma_qtv || dbRecord.ma_chu_tro || dbRecord.ma_nt || dbRecord.id),
    name: dbRecord.ho_ten || dbRecord.name || 'Người dùng',
    email: dbRecord.email || '',
    phone: dbRecord.sdt || dbRecord.phone || '',
    role: actualRole,
    avatar: dbRecord.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    age: dbRecord.age || 25,
    idCard: dbRecord.cccd || dbRecord.id_card || dbRecord.idCard || '',
    hometown: dbRecord.dia_chi || dbRecord.hometown || '',
    status: status === 'active' ? 'active' : 'locked',
    joinedAt: dbRecord.ngay_tao || dbRecord.joined_at || new Date().toISOString(),
    hostCode: dbRecord.host_code || dbRecord.hostCode,
    landlordId: dbRecord.ma_chu_tro || dbRecord.landlord_id || dbRecord.landlordId,
    houseName: dbRecord.ten_khu || dbRecord.house_name || dbRecord.houseName,
    houseAddress: dbRecord.dia_chi || dbRecord.house_address || dbRecord.houseAddress,
    roomId: dbRecord.ma_phong || dbRecord.room_id || dbRecord.roomId,
    licenseTier: dbRecord.license_tier || (actualRole === 'admin' ? 'enterprise' : actualRole === 'landlord' ? 'pro' : 'standard'),
    passwordHash: storedHash || undefined,
  };

  return {
    success: true,
    message: `Đã xác thực và đối chiếu thành công vai trò [${actualRole.toUpperCase()}] từ CSDL Supabase!`,
    user: mappedUser,
    fromSupabase: true,
  };
}

/**
 * Đổi mật khẩu ngay tại giao diện đăng nhập bằng cách đối chiếu Email và CCCD trên Supabase
 */
export async function resetPasswordWithEmailAndCccd(
  email: string,
  cccd: string,
  newPasswordPlain: string
): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'Chưa kết nối CSDL Supabase! Vui lòng cấu hình biến môi trường VITE_SUPABASE_URL.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCccd = cccd.trim().replace(/\s+/g, '');

  if (!cleanEmail || !cleanCccd) {
    return { success: false, message: 'Vui lòng nhập đầy đủ Email và Số CCCD!' };
  }

  if (!newPasswordPlain || newPasswordPlain.trim().length < 6) {
    return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
  }

  try {
    const newHash = await hashPassword(newPasswordPlain.trim());
    let found = false;
    let targetRole = '';

    // 1. Kiểm tra trên bảng NGUOI_THUE
    const { data: ntList } = await supabase
      .from('nguoi_thue')
      .select('ma_nt, ho_ten, email, cccd')
      .ilike('email', cleanEmail)
      .eq('cccd', cleanCccd)
      .limit(1);

    if (ntList && ntList.length > 0) {
      found = true;
      targetRole = 'Khách thuê';
      await supabase
        .from('nguoi_thue')
        .update({ password_hash: newHash })
        .eq('ma_nt', ntList[0].ma_nt);
    }

    // 2. Nếu chưa thấy, kiểm tra trên bảng CHU_TRO
    if (!found) {
      const { data: ctList } = await supabase
        .from('chu_tro')
        .select('ma_chu_tro, ho_ten, email, cccd')
        .ilike('email', cleanEmail)
        .eq('cccd', cleanCccd)
        .limit(1);

      if (ctList && ctList.length > 0) {
        found = true;
        targetRole = 'Chủ trọ';
        await supabase
          .from('chu_tro')
          .update({ password_hash: newHash })
          .eq('ma_chu_tro', ctList[0].ma_chu_tro);
      }
    }

    // 3. Nếu chưa thấy, kiểm tra trên bảng QUAN_TRI_VIEN
    if (!found) {
      const { data: qtvList } = await supabase
        .from('quan_tri_vien')
        .select('ma_qtv, ho_ten, email, cccd')
        .ilike('email', cleanEmail)
        .eq('cccd', cleanCccd)
        .limit(1);

      if (qtvList && qtvList.length > 0) {
        found = true;
        targetRole = 'Quản trị viên';
        await supabase
          .from('quan_tri_vien')
          .update({ password_hash: newHash })
          .eq('ma_qtv', qtvList[0].ma_qtv);
      }
    }

    // 4. Nếu chưa thấy, kiểm tra trên bảng PROFILES
    if (!found) {
      const { data: pList } = await supabase
        .from('profiles')
        .select('id, name, email, id_card, role')
        .ilike('email', cleanEmail)
        .eq('id_card', cleanCccd)
        .limit(1);

      if (pList && pList.length > 0) {
        found = true;
        targetRole = pList[0].role;
        await supabase
          .from('profiles')
          .update({ password_hash: newHash })
          .eq('id', pList[0].id);
      }
    }

    if (!found) {
      return {
        success: false,
        message: 'Không tìm thấy tài khoản có Email và CCCD khớp nhau trên CSDL Supabase!',
      };
    }

    // Đồng bộ cập nhật sang bảng profiles nếu có
    await supabase
      .from('profiles')
      .update({ password_hash: newHash })
      .ilike('email', cleanEmail);

    return {
      success: true,
      message: `Đổi mật khẩu thành công trên CSDL Supabase cho ${targetRole}! Bạn có thể đăng nhập ngay bằng mật khẩu mới.`,
    };
  } catch (err: any) {
    console.error('Lỗi khi đổi mật khẩu qua Email & CCCD trên Supabase:', err);
    return {
      success: false,
      message: err.message || 'Lỗi hệ thống khi cập nhật mật khẩu lên Supabase!',
    };
  }
}

/**
 * Đổi mật khẩu cho tài khoản đang đăng nhập trực tiếp trên CSDL Supabase
 */
export async function changePasswordInSupabase(
  user: User,
  oldPasswordPlain: string,
  newPasswordPlain: string
): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'Chưa kết nối Supabase, chỉ cập nhật nội bộ.' };
  }

  try {
    // 1. Xác thực mật khẩu cũ
    if (user.passwordHash) {
      const isOldValid = await verifyPassword(oldPasswordPlain, user.passwordHash);
      if (!isOldValid) {
        return { success: false, message: 'Mật khẩu hiện tại không chính xác trên CSDL!' };
      }
    }

    const newHash = await hashPassword(newPasswordPlain.trim());

    // 2. Cập nhật bảng tương ứng theo vai trò trong ERD
    if (user.role === 'admin') {
      await supabase
        .from('quan_tri_vien')
        .update({ password_hash: newHash })
        .or(`email.ilike.${user.email},ma_qtv.eq.${user.id}`);
    } else if (user.role === 'landlord') {
      await supabase
        .from('chu_tro')
        .update({ password_hash: newHash })
        .or(`email.ilike.${user.email},ma_chu_tro.eq.${user.id}`);
    } else {
      await supabase
        .from('nguoi_thue')
        .update({ password_hash: newHash })
        .or(`email.ilike.${user.email},ma_nt.eq.${user.id}`);
    }

    // 3. Cập nhật bảng profiles
    await supabase
      .from('profiles')
      .update({ password_hash: newHash })
      .or(`email.ilike.${user.email},id.eq.${user.id}`);

    return {
      success: true,
      message: 'Đã đổi mật khẩu thành công và đồng bộ mã băm an toàn vào CSDL Supabase!',
    };
  } catch (err: any) {
    console.error('Lỗi đổi mật khẩu Supabase:', err);
    return {
      success: false,
      message: err.message || 'Lỗi khi cập nhật mật khẩu trên Supabase!',
    };
  }
}

/**
 * Đồng bộ hoặc cập nhật hồ sơ người dùng lên Supabase (lưu avatar trực tiếp dưới SQL)
 */
export async function saveProfileToSupabase(user: User): Promise<boolean> {
  if (!supabase) return false;

  try {
    // 1. Lưu vào bảng ERD chuyên biệt tương ứng
    if (user.role === 'landlord') {
      await supabase.from('chu_tro').upsert(
        {
          ma_chu_tro: user.id,
          ho_ten: user.name,
          sdt: user.phone,
          email: user.email,
          dia_chi: user.houseAddress || user.hometown || '',
          cccd: user.idCard || '',
          password_hash: user.passwordHash || undefined,
          avatar: user.avatar,
          host_code: user.hostCode,
        },
        { onConflict: 'ma_chu_tro' }
      );
    } else if (user.role === 'tenant') {
      await supabase.from('nguoi_thue').upsert(
        {
          ma_nt: user.id,
          ho_ten: user.name,
          sdt: user.phone,
          email: user.email,
          cccd: user.idCard || '',
          dia_chi: user.hometown || user.houseAddress || '',
          password_hash: user.passwordHash || undefined,
          avatar: user.avatar,
          ma_phong: user.roomId,
          ma_chu_tro: user.landlordId,
        },
        { onConflict: 'ma_nt' }
      );
    } else if (user.role === 'admin') {
      await supabase.from('quan_tri_vien').upsert(
        {
          ma_qtv: user.id,
          ho_ten: user.name,
          sdt: user.phone,
          email: user.email,
          cccd: user.idCard || '',
          vai_tro: 'admin',
          password_hash: user.passwordHash || undefined,
          avatar: user.avatar,
        },
        { onConflict: 'ma_qtv' }
      );
    }

    // 2. Lưu vào bảng tổng hợp `profiles`
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar, // Lưu ảnh dạng Base64 hoặc URL trực tiếp vào cột TEXT của SQL
      age: user.age,
      id_card: user.idCard,
      hometown: user.hometown,
      status: user.status,
      host_code: user.hostCode,
      landlord_id: user.landlordId,
      house_name: user.houseName,
      house_address: user.houseAddress,
      room_id: user.roomId,
      license_tier: user.licenseTier,
      password_hash: user.passwordHash || undefined,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Lỗi ghi profiles vào Supabase:', error.message);
    }
    return true;
  } catch (err) {
    console.error('Supabase upsert error:', err);
    return false;
  }
}

/**
 * Tải danh sách tất cả người dùng từ CSDL Supabase
 */
export async function fetchUsersFromSupabase(): Promise<User[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return null;
    }

    return data.map((dbRecord) => ({
      id: String(dbRecord.id),
      name: dbRecord.name || 'Người dùng',
      email: dbRecord.email || '',
      phone: dbRecord.phone || '',
      role: (dbRecord.role as UserRole) || 'tenant',
      avatar: dbRecord.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      age: dbRecord.age || 25,
      idCard: dbRecord.id_card || dbRecord.idCard || '',
      hometown: dbRecord.hometown || '',
      status: dbRecord.status || 'active',
      joinedAt: dbRecord.created_at || dbRecord.joined_at || new Date().toISOString(),
      hostCode: dbRecord.host_code || dbRecord.hostCode,
      landlordId: dbRecord.landlord_id || dbRecord.landlordId,
      houseName: dbRecord.house_name || dbRecord.houseName,
      houseAddress: dbRecord.house_address || dbRecord.houseAddress,
      roomId: dbRecord.room_id || dbRecord.roomId,
      licenseTier: dbRecord.license_tier || dbRecord.licenseTier || 'standard',
      passwordHash: dbRecord.password_hash,
    }));
  } catch {
    return null;
  }
}
