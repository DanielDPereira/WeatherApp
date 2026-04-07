<h1 align="center">⛅ WeatherApp</h1>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Licen%C3%A7a-MIT-success?style=for-the-badge" alt="Licença MIT">
</p>

<p align="center">
  <strong>Uma aplicação web responsiva e elegante para consulta meteorológica.</strong>
</p>

---

## 🎓 Contexto Académico

Este projeto foi desenvolvido como atividade prática e avaliativa no âmbito da unidade curricular de **Engenharia de Software II**, do curso de **Análise e Desenvolvimento de Sistemas (ADS)** da **FATEC São José dos Campos (3º semestre)**, sob a orientação do professor **Claudio Etelvino de Lima**.

O objetivo primordial foi aplicar na prática os conceitos de Engenharia de Software abordados nas aulas, desde a fase de levantamento de requisitos (Histórias de Utilizador e Backlog), passando pela prototipagem visual, até à implementação de código limpo consumindo uma API REST externa.

## 🔗 Acessos e Demonstração

Explore a aplicação em funcionamento e a documentação visual do projeto:

* 🌍 **Aplicação em Produção (Live):** [Aceder ao WeatherApp](https://danieldpereira.github.io/WeatherApp/)
* 🎨 **Protótipo de Interface (Figma):** [Visualizar Protótipo Interativo](https://www.figma.com/proto/RlKsQbmlQ3wuVFUOWG5HeQ/Daniel-WeatherAPP-prototype?node-id=0-1&t=s7l0CzvCsdXQ7DDL-1)

---

## 🎯 Principais Funcionalidades

* **Pesquisa Global de Localidades:** Integração com a API de Geocodificação para procurar e validar qualquer cidade do mundo.
* **Dados Meteorológicos em Tempo Real:** Exibição da temperatura atual, sensação térmica, nível de humidade, velocidade do vento e visibilidade.
* **Alternância de Sistema de Medidas:** Possibilidade de alternar instantaneamente entre a escala Celsius (°C) e Fahrenheit (°F).
* **Previsão a Curto Prazo:** Listagem horizontal (carrossel) com a previsão meteorológica (temperaturas máxima e mínima) para os dias seguintes.
* **Mapeamento de Estados (WMO):** Conversão automática dos códigos meteorológicos da Organização Meteorológica Mundial para descrições de texto e ícones visuais (emojis) adequados.
* **Feedback Visual e Tratamento de Erros:** Exibição de *spinners* de carregamento (loading) e alertas visuais amigáveis caso o utilizador procure uma cidade inexistente.

---

## 📋 Backlog do Produto (Histórias de Utilizador)

A arquitetura do sistema foi desenhada com base nas seguintes necessidades focadas no utilizador final:

| ID | História de Utilizador | Critérios de Aceitação |
| :--- | :--- | :--- |
| **US01** | Como utilizador, quero pesquisar o clima atual digitando o nome de uma cidade, para obter os dados meteorológicos precisos desse local. | • O ecrã inicial deve conter um formulário de pesquisa claro.<br>• O sistema deve validar entradas vazias.<br>• Deve apresentar uma mensagem de erro compreensível caso a localidade não seja encontrada. |
| **US02** | Como utilizador, quero alternar a temperatura entre graus Celsius (°C) e Fahrenheit (°F), para adaptar a visualização à minha preferência métrica. | • Botões de interrupção visíveis na interface principal.<br>• A conversão deve atualizar não só a temperatura central, mas também a sensação térmica e a previsão diária. |
| **US03** | Como utilizador, pretendo visualizar os indicadores de humidade, velocidade do vento, sensação térmica e visibilidade, para ter uma visão detalhada do ambiente. | • O cartão (card) principal deve apresentar um *grid* de detalhes com ícones representativos e valores arredondados para facilitar a leitura. |
| **US04** | Como utilizador, quero visualizar a previsão do tempo para os próximos dias, para auxiliar no meu planeamento pessoal. | • Deve existir uma secção inferior com *scroll* horizontal apresentando a previsão (dia da semana, ícone, temperatura máxima e mínima). |
| **US05** | Como utilizador, pretendo visualizar uma representação visual (ícone) e textual (ex: "Céu Limpo"), para assimilar rapidamente as condições atuais. | • O sistema deve processar o código "WMO" da API e retornar os descritivos em português, juntamente com o emoji correspondente. |

---

## 🛠️ Stack Tecnológica

O projeto foi construído garantindo uma elevada performance e nenhuma dependência de bibliotecas ou *frameworks* externas complexas:

* **Markup & Estrutura:** HTML5 Semântico (com atributos de acessibilidade ARIA).
* **Estilização & UI:** CSS3 Puro (Animações, Flexbox, CSS Grid, variáveis nativas e filtro `backdrop-filter` para o efeito visual de vidro fosco).
* **Lógica de Negócio:** Vanilla JavaScript (ES6+), suportando assincronismo (Async/Await) e manipulação direta do DOM.
* **Fornecedor de Dados (APIs):** [Open-Meteo](https://open-meteo.com/). Uma solução de código aberto que fornece dados meteorológicos fiáveis sem necessidade de *API Keys*.

---

## ⚙️ Como Executar o Projeto

Como a aplicação assenta inteiramente em ficheiros estáticos geridos no lado do cliente (Client-Side), a sua execução local é imediata:

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/DanielDPereira/WeatherApp.git
