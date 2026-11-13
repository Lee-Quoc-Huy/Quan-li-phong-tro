/**
 * Module bảo mật tài khoản, băm mật khẩu và mã hóa danh tính
 * Đảm bảo mật khẩu không bao giờ lưu dưới dạng văn bản thô (plain text)
 */

const PASSWORD_SALT = 'smart_rental_salt_2026';

// Băm SHA-256 của mật khẩu Quản Trị Viên (Admin) tối cao (mật khẩu: admin)
// Tuyệt đối không lưu mật khẩu thô trong mã nguồn hoặc gói client bundle
export const ADMIN_PASSWORD_HASH = '89c00d2ecfa625790c1d12a57f3f08282d90b9847b8969a0ae3c46a903b722dc';

/**
 * Băm mật khẩu bằng thuật toán SHA-256 chuẩn Web Crypto API
 */
export async function hashPassword(password: string): Promise<string> {
  const cleanPassword = (password || '').trim();
  const msgBuffer = new TextEncoder().encode(`${cleanPassword}:${PASSWORD_SALT}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Đối chiếu mật khẩu nhập vào với mã băm lưu trong CSDL
 */
export async function verifyPassword(password: string, storedHash?: string): Promise<boolean> {
  if (!storedHash) return false;
  const computed = await hashPassword(password);
  return computed === storedHash;
}

/**
 * Làm sạch dữ liệu người dùng trước khi chia sẻ hoặc hiển thị cho người dùng khác
 * Loại bỏ hash mật khẩu và các thông tin nhạy cảm
 */
export function sanitizeUser<T extends { passwordHash?: string }>(user: T): Omit<T, 'passwordHash'> {
  const cleaned = { ...user };
  delete cleaned.passwordHash;
  return cleaned;
}
