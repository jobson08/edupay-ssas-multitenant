const ATIVIDADES_DISPONIVEIS = [
  { nome: 'Futebol', requerIdade: true },
  { nome: 'CrossFit', requerIdade: false },
  { nome: 'Academia', requerIdade: false },
];

const CATEGORIAS_PADRAO_FUTEBOL = [
  { nome: 'Sub-7', idadeMaxima: 7 }, //para crianças de 5 e 7 anos.
  { nome: 'Sub-9', idadeMaxima: 9 }, //para crianças de 8 e 9 anos.
  { nome: 'Sub-11', idadeMaxima: 11 }, //para crianças de 10 e 11 anos.
  { nome: 'Sub-13', idadeMaxima: 13 }, //para crianças de 12 e 13 anos.
  { nome: 'Sub-15', idadeMaxima: 15 },//para adolescentes de 14 e 15 anos.
  { nome: 'Sub-17', idadeMaxima: 17 }, //para adolescentes de 16 e 17 anos. 
  { nome: 'Sub-20', idadeMaxima: 20 }, //para adolescentes de 18 e 20 anos. 
];

module.exports = { ATIVIDADES_DISPONIVEIS, CATEGORIAS_PADRAO_FUTEBOL };