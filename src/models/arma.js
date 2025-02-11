const mongoose = require('mongoose');

const armaSchema = new mongoose.Schema({
  MarcaArma: {
    type: String,
    required: true,
  },
  EspecieArma: {
    type: String,
    required: true,
  },
  Modelo: {
    type: String,
    maxlength: 15,
  },
  Calibre: {
    type: String,
    maxlength: 30,
  },
  GrupoCalibreArma: {
    type: String,
  },
  CapacidadeCartucho: {
    type: String,
  },
  TipoFuncionamentoArma: {
    type: String,
  },
  QuantidadeCanos: {
    type: String,
  },
  ComprimentoCano: {
    type: String,
  },
  UnidadeMedidaCano: {
    type: String,
    enum: ['CM', 'MM', 'POL'],
  },
  TipoAlma: {
    type: String,
    enum: ['L', 'R', 'ND'],
  },
  NumeroRaias: {
    type: String,
  },
  SentidoRaias: {
    type: String,
    enum: ['E', 'D', 'ND'],
  },
  NomeAcabamento: {
    type: String,
    maxlength: 30,
  },
  Pais: {
    type: String,
  },
});

const Arma = mongoose.model('Arma', armaSchema);

module.exports = Arma;
