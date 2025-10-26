const calcularIdade = (birthDate) => {
  const hoje = new Date();
  const nascimento = new Date(birthDate);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

const isMaiorIdade = (birthDate) => {
  if (!birthDate) return false;
  return calcularIdade(birthDate) >= 18;
};

module.exports = { calcularIdade, isMaiorIdade };