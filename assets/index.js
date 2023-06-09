const getElement = (...queries) => document.querySelector(...queries);
const ctx = getElement('#myChart').getContext('2d');

// Função para obter a cotação atual do dólar em relação ao real
const obterCotacaoDolarReal = async() => {
  return fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados/ultimos/1?formato=json')
    .then(response => response.json())
    .then(data => {
      const cotacaoDolarReal = data[0].valor;
      return cotacaoDolarReal;
    })
    .catch(error => {
      console.log('Erro ao obter a cotação do dólar em relação ao real:', error);
    });
}


// Função para obter o histórico de cotações do dólar nos últimos 7 dias
const obterHistoricoCotacoesDolar= async () =>{
    const hoje = new Date();
    const dataSeteDiasAtras = new Date();
    dataSeteDiasAtras.setDate(dataSeteDiasAtras.getDay() - 7);
    
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados?formato=json&dataInicial=${dataSeteDiasAtras.toISOString()}&dataFinal=${hoje.toISOString()}`;
    return await fetch(url)
    .then(response => response.json())
    .then(data => {
      const cotacoes = data.map(item => item.valor);
      return cotacoes.slice(-7); // Retorna apenas os últimos 7 valores
    })
    .catch (error =>{
      console.log('Erro ao obter o histórico de cotações do dólar:', error);
    })
  }
  
  // Função para atualizar o gráfico com o histórico de cotações do dólar em relação ao real
  const atualizarGrafico= async ()=> {
    const cotacoesDolar = await obterHistoricoCotacoesDolar();
    const cotacaoDolarReal = await obterCotacaoDolarReal();
    
    const cotacoesRealDolar = cotacoesDolar.map(valorDolar => 1 / valorDolar); // 1 real convertido para dólar
    const cotacoesDolarReal = cotacoesDolar.map(valorDolar => valorDolar / cotacaoDolarReal); // 1 dólar convertido para real
    
    const hoje = new Date();
    const dataSeteDiasAtras = new Date();
    dataSeteDiasAtras.setDate(dataSeteDiasAtras.getDate() - 7);
    
    const labels = [];
    let dataAtual = new Date(dataSeteDiasAtras);
    
    while (dataAtual <= hoje) {
      if (dataAtual.getDay() !== 0 && dataAtual.getDay() !== 6) {
        const diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const label = `${diaSemana[dataAtual.getDay()]}`;
        labels.push(label);
      }
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    

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
                max:10,
            },
        },
    },
  };

  let myChart = new Chart(ctx, config);
}

// Chama a função
atualizarGrafico()