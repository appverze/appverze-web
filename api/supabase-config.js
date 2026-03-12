// Supabase 공개 설정 반환 (URL + 공개 키만, DB 연결 문자열은 절대 노출 금지)
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publicKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }
  // 기존 프론트 호환을 위해 키 필드명은 supabaseAnonKey 유지
  res.status(200).json({ supabaseUrl: url, supabaseAnonKey: publicKey });
}
