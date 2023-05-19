const getElement = (...queries) => document.querySelector(...queries);
const ctx = getElement('#myChart').getContext('2d');

// Função para obter a cotação atual do dólar em relação ao real
async function obterCotacaoDolarReal() {
  try {
    const response = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados/ultimos/1?formato=json');
    const data = await response.json();
    const cotacaoDolarReal = data[0].valor;
    return cotacaoDolarReal;
  } catch (error) {
    console.log('Erro ao obter a cotação do dólar em relação ao real:', error);
  }
}

// Função para obter o histórico de cotações do dólar nos últimos 7 dias
async function obterHistoricoCotacoesDolar() {
  try {
    const hoje = new Date();
    const dataSeteDiasAtras = new Date();
    dataSeteDiasAtras.setDate(dataSeteDiasAtras.getDate() - 7);

    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados?formato=json&dataInicial=${dataSeteDiasAtras.toISOString()}&dataFinal=${hoje.toISOString()}`;
    const response = await fetch(url);
    const data = await response.json();
    const cotacoes = data.map(item => item.valor);
    return cotacoes.slice(-7); // Retorna apenas os últimos 7 valores
  } catch (error) {
    console.log('Erro ao obter o histórico de cotações do dólar:', error);
  }
}

// Função para atualizar o gráfico com o histórico de cotações do dólar em relação ao real
async function atualizarGrafico() {
  const cotacoesDolar = await obterHistoricoCotacoesDolar();
  const cotacaoDolarReal = await obterCotacaoDolarReal();

  const cotacoesRealDolar = cotacoesDolar.map(valorDolar => 1 / valorDolar); // 1 real convertido para dólar
  const cotacoesDolarReal = cotacoesDolar.map(valorDolar => valorDolar / cotacaoDolarReal); // 1 dólar convertido para real

  const labels = cotacoesDolar.map((_, index) => `Dia ${index + 1}`);

  const data = {
    labels: labels,
    datasets: [
      {
        label: '1 Dólar em relação a 1 Real',
        data: cotacoesDolar,
        borderColor: '#FF6384',
        backgroundColor: '#FF6384',
      },
      {
        label: '1 Real em relação a 1 Dólar',
        data: cotacoesRealDolar,
        borderColor: '#03C03C',
        backgroundColor: '#03C03C',
      },
    ],
  };

  const config = {
    type: 'bar',
    data: data,
    options:{
        scales:{
            y:{
                min:0,
                max:5,
            },
        },
    },
  };

  let myChart = new Chart(ctx, config);
}

// Chama a função
atualizarGrafico()