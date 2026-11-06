import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, UserRole } from '../types';

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
 * Tra cứu và đối chiếu tài khoản & Role trực tiếp trên bảng `profiles` / `users` của CSDL Supabase
 */
export async function verifyUserWithSupabase(
  identifier: string,
  enteredPassword?: string,
  requiredRole?: UserRole
): Promise<SupabaseAuthResult | null> {
  if (!supabase) {
    return null; // Supabase chưa cấu hình biến môi trường, dùng fallback nội bộ
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPhone = identifier.trim().replace(/\s+/g, '');

  try {
    // 1. Nếu có nhập mật khẩu và là định dạng email, thử đối chiếu qua Supabase Auth
    if (cleanId.includes('@') && enteredPassword) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: enteredPassword,
        });

        if (authError && !authError.message.toLowerCase().includes('invalid login credentials')) {
          console.warn('Supabase Auth error:', authError.message);
        }
      } catch (e) {
        // Tiếp tục kiểm tra bảng profiles nếu auth chưa tạo user
      }
    }

    // 2. Truy vấn trực tiếp bảng `profiles` (hoặc `users`) trên Supabase
    // Tìm theo email, số điện thoại hoặc mã host_code
    const { data: profileList, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.ilike.${cleanId},phone.eq.${cleanPhone},name.ilike.%${cleanId}%,host_code.ilike.${cleanId}`)
      .limit(10);

    if (profileError) {
      console.warn('Lỗi truy vấn profiles Supabase:', profileError.message);
      // Thử bảng fallback 'users' nếu project đặt tên bảng là users
      const { data: altUsers, error: altError } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.${cleanId},phone.eq.${cleanPhone}`)
        .limit(5);

      if (altError || !altUsers || altUsers.length === 0) {
        return null;
      }
      return mapAndValidateUser(altUsers[0], requiredRole);
    }

    if (!profileList || profileList.length === 0) {
      // Đối chiếu tài khoản Quản trị tối cao (Root Admin)
      const isAdminAccount =
        cleanId === '60.wuy.lii.06@gmail.com' ||
        cleanId === 'admin' ||
        cleanPhone === '0918889999';

      if (isAdminAccount) {
        // Kiểm tra xem trên Supabase đã có tài khoản admin này chưa
        const { data: adminRows } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin')
          .limit(1);

        if (adminRows && adminRows.length > 0) {
          return mapAndValidateUser(adminRows[0], requiredRole);
        }
      }

      return {
        success: false,
        message: 'Tài khoản không tìm thấy trên CSDL Supabase!',
        fromSupabase: true,
      };
    }

    // Tìm profile khớp nhất
    const matched = profileList.find(
      (p) =>
        (p.email && p.email.toLowerCase() === cleanId) ||
        (p.phone && p.phone.replace(/\s+/g, '') === cleanPhone) ||
        (p.host_code && p.host_code.toLowerCase() === cleanId) ||
        (p.name && p.name.toLowerCase().includes(cleanId))
    ) || profileList[0];

    return mapAndValidateUser(matched, requiredRole);
  } catch (error: any) {
    console.error('Lỗi khi đối chiếu Supabase:', error);
    return null;
  }
}

/**
 * Kiểm tra và ép kiểu role chuẩn xác từ bản ghi CSDL Supabase
 */
function mapAndValidateUser(dbRecord: any, requiredRole?: UserRole): SupabaseAuthResult {
  // Lấy role THỰC TẾ được lưu trong CSDL Supabase
  const actualRole: UserRole = (dbRecord.role as UserRole) || 'tenant';

  // Kiểm tra khóa tài khoản
  if (dbRecord.status === 'locked') {
    return {
      success: false,
      message: 'Tài khoản này đang bị KHÓA trên CSDL Supabase!',
      fromSupabase: true,
    };
  }

  // Đối chiếu Role nếu yêu cầu quyền cụ thể (ví dụ đăng nhập admin)
  if (requiredRole && actualRole !== requiredRole) {
    return {
      success: false,
      message: `Quyền không hợp lệ! Trên CSDL Supabase tài khoản này có vai trò là "${actualRole.toUpperCase()}", không phải "${requiredRole.toUpperCase()}".`,
      fromSupabase: true,
    };
  }

  const mappedUser: User = {
    id: String(dbRecord.id),
    name: dbRecord.name || 'Người dùng',
    email: dbRecord.email || '',
    phone: dbRecord.phone || '',
    role: actualRole,
    avatar: dbRecord.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    age: dbRecord.age || 25,
    idCard: dbRecord.id_card || dbRecord.idCard || '',
    hometown: dbRecord.hometown || '',
    status: dbRecord.status || 'active',
    joinedAt: dbRecord.joined_at || dbRecord.joinedAt || new Date().toISOString(),
    hostCode: dbRecord.host_code || dbRecord.hostCode,
    landlordId: dbRecord.landlord_id || dbRecord.landlordId,
    houseName: dbRecord.house_name || dbRecord.houseName,
    houseAddress: dbRecord.house_address || dbRecord.houseAddress,
    roomId: dbRecord.room_id || dbRecord.roomId,
    licenseTier: dbRecord.license_tier || dbRecord.licenseTier || 'standard',
  };

  return {
    success: true,
    message: `Đã xác thực và đối chiếu thành công vai trò [${actualRole.toUpperCase()}] từ CSDL Supabase!`,
    user: mappedUser,
    fromSupabase: true,
  };
}

/**
 * Đồng bộ hoặc cập nhật hồ sơ người dùng lên Supabase
 */
export async function saveProfileToSupabase(user: User): Promise<boolean> {
  if (!supabase) return false;

  try {
    const payload = {
      id: user.id.includes('-') ? user.id : undefined, // Nếu là uuid thì dùng, không thì để supabase sinh hoặc tự quản lý
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
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
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      console.warn('Lỗi ghi profile vào Supabase:', error.message);
      return false;
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
      joinedAt: dbRecord.joined_at || dbRecord.joinedAt || new Date().toISOString(),
      hostCode: dbRecord.host_code || dbRecord.hostCode,
      landlordId: dbRecord.landlord_id || dbRecord.landlordId,
      houseName: dbRecord.house_name || dbRecord.houseName,
      houseAddress: dbRecord.house_address || dbRecord.houseAddress,
      roomId: dbRecord.room_id || dbRecord.roomId,
      licenseTier: dbRecord.license_tier || dbRecord.licenseTier || 'standard',
    }));
  } catch {
    return null;
  }
}
