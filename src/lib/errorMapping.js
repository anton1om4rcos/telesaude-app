export function translateAuthError(errorMsg) {
  if (!errorMsg) return 'Ocorreu um erro desconhecido.';
  
  const msg = errorMsg.toLowerCase();
  
  if (msg.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (msg.includes('user already registered')) {
    return 'Este e-mail já está cadastrado em nosso sistema.';
  }
  if (msg.includes('password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (msg.includes('email not confirmed')) {
    return 'O seu e-mail ainda não foi confirmado.';
  }
  if (msg.includes('rate limit')) {
    return 'Muitas tentativas. Por favor, aguarde alguns minutos e tente novamente.';
  }
  if (msg.includes('network error') || msg.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet.';
  }

  // Se não bater com nada conhecido, retorna uma mensagem genérica ou a original se for seguro
  return 'Ocorreu um erro na autenticação. Tente novamente.';
}
