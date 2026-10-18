
// Define um identificador para os dados desta versão do projeto.
const CHAVE = "healthfood_admin_zero_v2";

// Cria um banco de dados demonstrativo inicialmente vazio.
const dadosIniciais = {
    fornecedores: [], // Lista dos fornecedores cadastrados.
    restaurantes: [], // Lista dos restaurantes parceiros.
    produtos: [], // Lista de alimentos e bebidas.
    pedidos: [], // Lista de pedidos registrados.
    financeiro: [] // Lista de receitas e despesas.
}; // Finaliza a estrutura inicial dos dados.

// Recupera informações salvas anteriormente no navegador.
function carregarDados() {
    try { // Inicia uma tentativa segura de leitura.
        const salvo = localStorage.getItem(CHAVE); // Busca os dados armazenados.
        const resultado = salvo ? JSON.parse(salvo) : {}; // Converte os dados encontrados.
        return { // Retorna a estrutura completa do banco.
            fornecedores: Array.isArray(resultado.fornecedores) ? resultado.fornecedores : [], // Recupera fornecedores.
            restaurantes: Array.isArray(resultado.restaurantes) ? resultado.restaurantes : [], // Recupera restaurantes.
            produtos: Array.isArray(resultado.produtos) ? resultado.produtos : [], // Recupera produtos.
            pedidos: Array.isArray(resultado.pedidos) ? resultado.pedidos : [], // Recupera pedidos.
            financeiro: Array.isArray(resultado.financeiro) ? resultado.financeiro : [] // Recupera finanças.
        }; // Finaliza o objeto recuperado.
    } catch (erro) { // Trata erros de leitura.
        console.error("Erro ao carregar informações:", erro); // Mostra o problema no console.
        return structuredClone(dadosIniciais); // Utiliza dados vazios quando necessário.
    } // Encerra a tentativa de leitura.
} // Finaliza a função de carregamento.

// Inicializa a base de dados do programa.
let banco = carregarDados(); // Armazena os dados carregados.

// Guarda o registro que o administrador está editando.
let edicao = null; // Começa sem nenhum registro em edição.

// Formata números na moeda brasileira.
function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); // Retorna valores como R$ 0,00.
} // Finaliza a função de moeda.

// Protege a interface contra códigos inseridos nos formulários.
function seguro(texto) {
    const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }; // Define as substituições necessárias.
    return String(texto ?? "").replace(/[&<>"']/g, caractere => mapa[caractere]); // Substitui caracteres especiais.
} // Finaliza a proteção dos textos.

// Salva informações no armazenamento local.
function salvar() {
    try { // Verifica se é possível salvar.
        localStorage.setItem(CHAVE, JSON.stringify(banco)); // Grava os registros no navegador.
    } catch (erro) { // Trata falhas no armazenamento.
        console.error("Erro ao salvar:", erro); // Mostra o erro no console.
        alert("Não foi possível salvar os dados neste navegador."); // Informa o administrador.
    } // Finaliza o tratamento.
    atualizarTudo(); // Atualiza as tabelas e os indicadores.
} // Finaliza a função de salvamento.

// Identifica todos os botões de navegação do menu.
document.querySelectorAll(".menu-btn").forEach(botao => {
    botao.addEventListener("click", () => { // Detecta o clique em uma opção.
        document.querySelectorAll(".menu-btn").forEach(item => item.classList.remove("ativo")); // Retira os destaques anteriores.
        document.querySelectorAll(".pagina").forEach(item => item.classList.remove("ativa")); // Oculta as outras páginas.
        botao.classList.add("ativo"); // Destaca o botão escolhido.
        const pagina = botao.dataset.page; // Obtém o identificador da página.
        document.getElementById(pagina).classList.add("ativa"); // Exibe a página escolhida.
        document.getElementById("titulo-pagina").textContent = botao.textContent.trim().slice(2).trim(); // Atualiza o título superior.
        window.scrollTo({ top: 0, behavior: "smooth" }); // Retorna ao topo do site.
    }); // Finaliza o evento de clique.
}); // Finaliza a configuração da navegação.

// Define a ordem das informações exibidas em cada tabela.
const colunas = {
    fornecedores: ["nome", "contato", "email", "categoria"], // Campos dos fornecedores.
    restaurantes: ["nome", "cidade", "contato", "status"], // Campos dos restaurantes.
    produtos: ["nome", "preco", "restaurante", "categoria"], // Campos dos produtos.
    pedidos: ["cliente", "restaurante", "valor", "status"], // Campos dos pedidos.
    financeiro: ["descricao", "tipo", "valor", "data"] // Campos das movimentações.
}; // Finaliza a configuração das tabelas.

// Identifica os campos que armazenam valores monetários.
function campoMonetario(tipo, campo) {
    return (tipo === "produtos" && campo === "preco") || (["pedidos", "financeiro"].includes(tipo) && campo === "valor"); // Informa quando formatar como dinheiro.
} // Finaliza a verificação dos campos monetários.

// Cria etiquetas coloridas de situações e tipos.
function etiqueta(valor) {
    const negativos = ["Inativo", "Cancelado", "Despesa"]; // Lista situações negativas.
    const pendentes = ["Pendente", "Em preparo", "Em análise"]; // Lista situações de atenção.
    const classe = negativos.includes(valor) ? "perigo" : pendentes.includes(valor) ? "atencao" : ""; // Escolhe uma cor.
    return `<span class="etiqueta ${classe}">${seguro(valor)}</span>`; // Retorna uma etiqueta colorida.
} // Finaliza a função de etiquetas.

// Preenche uma tabela com seus registros.
function mostrarTabela(tipo) {
    const corpo = document.getElementById(`lista-${tipo}`); // Localiza a tabela correspondente.
    const registros = banco[tipo]; // Recupera os registros da categoria.
    if (registros.length === 0) { // Verifica se não há informações.
        corpo.innerHTML = `<tr><td colspan="${colunas[tipo].length + 1}">Nenhum registro cadastrado até o momento.</td></tr>`; // Apresenta a mensagem.
        return; // Encerra a função para uma tabela vazia.
    } // Finaliza a verificação.
    corpo.innerHTML = registros.map(registro => { // Constrói as linhas da tabela.
        const celulas = colunas[tipo].map(campo => { // Percorre as colunas de cada registro.
            const valor = registro[campo]; // Recupera a informação da coluna.
            if (campoMonetario(tipo, campo)) return `<td>${moeda(valor)}</td>`; // Formata os valores financeiros.
            if (campo === "status" || campo === "tipo") return `<td>${etiqueta(valor)}</td>`; // Exibe etiquetas de situação.
            return `<td>${seguro(valor)}</td>`; // Exibe os demais valores com proteção.
        }).join(""); // Junta as células geradas.
        const acoes = `<td><button type="button" class="botao-acao" data-acao="editar" data-tipo="${tipo}" data-id="${registro.id}">Editar</button><button type="button" class="botao-acao excluir" data-acao="excluir" data-tipo="${tipo}" data-id="${registro.id}">Excluir</button></td>`; // Cria os botões de edição e exclusão.
        return `<tr>${celulas}${acoes}</tr>`; // Monta uma linha completa.
    }).join(""); // Junta todas as linhas e exibe a tabela.
} // Finaliza a renderização das tabelas.

// Configura todos os formulários do site.
document.querySelectorAll("form[id^='form-']").forEach(formulario => {
    formulario.addEventListener("submit", evento => { // Detecta quando o administrador salva um cadastro.
        evento.preventDefault(); // Impede o recarregamento da página.
        const tipo = formulario.id.replace("form-", ""); // Identifica a categoria.
        const valores = Object.fromEntries(new FormData(formulario).entries()); // Recupera todos os campos preenchidos.
        ["preco", "valor"].forEach(campo => { // Percorre os possíveis campos numéricos.
            if (valores[campo] !== undefined) valores[campo] = Number(valores[campo]); // Transforma o valor em número.
        }); // Finaliza a conversão monetária.
        if (edicao && edicao.tipo === tipo) { // Verifica se é uma edição.
            const indice = banco[tipo].findIndex(item => item.id === edicao.id); // Encontra o registro original.
            if (indice !== -1) banco[tipo][indice] = { ...banco[tipo][indice], ...valores }; // Substitui as informações antigas.
            edicao = null; // Encerra o modo de edição.
        } else { // Executa quando é um novo cadastro.
            const id = Date.now() + Math.floor(Math.random() * 100000); // Gera um identificador para o registro.
            banco[tipo].push({ id, ...valores }); // Adiciona os dados ao banco local.
        } // Finaliza a escolha entre cadastro e edição.
        formulario.reset(); // Limpa os campos preenchidos.
        formulario.querySelector("button[type='submit']").textContent = "+ Salvar registro"; // Restaura o texto do botão.
        if (tipo === "financeiro") definirDataAtual(); // Restaura a data de hoje no financeiro.
        salvar(); // Salva o registro e atualiza o painel.
        alert("Registro salvo com sucesso!"); // Confirma a operação.
    }); // Finaliza o evento de envio.
}); // Finaliza a configuração dos formulários.

// Permite editar e excluir registros nas tabelas.
document.addEventListener("click", evento => {
    const botao = evento.target.closest("[data-acao]"); // Procura um botão com ação administrativa.
    if (!botao) return; // Ignora cliques em outros elementos.
    const tipo = botao.dataset.tipo; // Recupera a categoria do registro.
    const id = Number(botao.dataset.id); // Recupera o identificador do registro.
    const registro = banco[tipo]?.find(item => item.id === id); // Encontra o registro.
    if (!registro) return; // Encerra se o registro não existir.

    if (botao.dataset.acao === "excluir") { // Verifica se o administrador deseja excluir.
        if (!confirm("Deseja realmente excluir este registro?")) return; // Solicita confirmação.
        banco[tipo] = banco[tipo].filter(item => item.id !== id); // Remove o registro selecionado.
        if (edicao && edicao.tipo === tipo && edicao.id === id) edicao = null; // Cancela edição daquele registro.
        salvar(); // Grava a exclusão.
        return; // Finaliza a operação.
    } // Finaliza o procedimento de exclusão.

    if (botao.dataset.acao === "editar") { // Verifica se o administrador deseja editar.
        const formulario = document.getElementById(`form-${tipo}`); // Localiza o formulário correspondente.
        Object.keys(registro).forEach(campo => { // Percorre os dados cadastrados.
            const entrada = formulario.elements.namedItem(campo); // Encontra o campo correspondente.
            if (entrada) entrada.value = registro[campo]; // Preenche com os dados anteriores.
        }); // Finaliza o preenchimento dos campos.
        edicao = { tipo, id }; // Identifica o registro em edição.
        formulario.querySelector("button[type='submit']").textContent = "Salvar alterações"; // Altera o texto do botão.
        formulario.scrollIntoView({ behavior: "smooth", block: "center" }); // Leva o administrador ao formulário.
    } // Finaliza a edição.
}); // Finaliza os eventos das tabelas.

// Soma todas as movimentações de uma determinada categoria financeira.
function calcularTotal(tipo) {
    return banco.financeiro.filter(item => item.tipo === tipo).reduce((soma, item) => soma + Number(item.valor), 0); // Calcula receitas ou despesas.
} // Finaliza a soma dos valores.

// Atualiza os números apresentados no painel.
function atualizarIndicadores() {
    const receitas = calcularTotal("Receita"); // Calcula as receitas cadastradas.
    const despesas = calcularTotal("Despesa"); // Calcula as despesas cadastradas.
    const saldo = receitas - despesas; // Obtém o resultado financeiro.
    const total = receitas + despesas; // Calcula a soma utilizada nas barras.
    document.getElementById("total-fornecedores").textContent = banco.fornecedores.length; // Atualiza fornecedores.
    document.getElementById("total-restaurantes").textContent = banco.restaurantes.length; // Atualiza restaurantes.
    document.getElementById("total-receitas").textContent = moeda(receitas); // Atualiza receitas da visão geral.
    document.getElementById("total-despesas").textContent = moeda(despesas); // Atualiza despesas da visão geral.
    document.getElementById("saldo-geral").textContent = moeda(saldo); // Atualiza o resultado da visão geral.
    document.getElementById("total-produtos").textContent = banco.produtos.length; // Atualiza a contagem de produtos.
    document.getElementById("total-pedidos").textContent = banco.pedidos.length; // Atualiza a contagem de pedidos.
    document.getElementById("restaurantes-ativos").textContent = banco.restaurantes.filter(item => item.status === "Ativo").length; // Conta restaurantes ativos.
    document.getElementById("pedidos-pendentes").textContent = banco.pedidos.filter(item => item.status === "Pendente").length; // Conta pedidos pendentes.
    document.getElementById("financeiro-receitas").textContent = moeda(receitas); // Atualiza receitas na página financeira.
    document.getElementById("financeiro-despesas").textContent = moeda(despesas); // Atualiza despesas na página financeira.
    document.getElementById("financeiro-saldo").textContent = moeda(saldo); // Atualiza resultado na página financeira.
    document.getElementById("barra-receitas").style.width = `${total > 0 ? (receitas / total) * 100 : 0}%`; // Ajusta o tamanho da barra verde.
    document.getElementById("barra-despesas").style.width = `${total > 0 ? (despesas / total) * 100 : 0}%`; // Ajusta o tamanho da barra laranja.
    document.getElementById("saldo-geral").style.color = saldo < 0 ? "#d45b59" : "#16734c"; // Destaca saldos negativos em vermelho.
    document.getElementById("financeiro-saldo").style.color = saldo < 0 ? "#d45b59" : "#16734c"; // Atualiza a cor do resultado financeiro.
} // Finaliza a atualização dos indicadores.

// Atualiza todas as tabelas e todos os totais.
function atualizarTudo() {
    Object.keys(colunas).forEach(tipo => mostrarTabela(tipo)); // Atualiza cada tabela cadastrada.
    atualizarIndicadores(); // Recalcula os indicadores.
} // Finaliza a atualização geral.

// Preenche o campo financeiro com a data atual.
function definirDataAtual() {
    const agora = new Date(); // Obtém a data do computador.
    const ano = agora.getFullYear(); // Identifica o ano.
    const mes = String(agora.getMonth() + 1).padStart(2, "0"); // Identifica o mês com dois dígitos.
    const dia = String(agora.getDate()).padStart(2, "0"); // Identifica o dia com dois dígitos.
    document.querySelector("#form-financeiro [name='data']").value = `${ano}-${mes}-${dia}`; // Preenche o campo de data.
} // Finaliza a função da data.

// Exporta as receitas e despesas cadastradas para CSV.
document.getElementById("exportar").addEventListener("click", () => {
    const cabecalho = ["Descrição", "Tipo", "Valor", "Data"]; // Define as colunas do arquivo.
    const linhas = banco.financeiro.map(item => [item.descricao, item.tipo, item.valor, item.data]); // Obtém os registros financeiros.
    const tabela = [cabecalho, ...linhas]; // Junta o cabeçalho e os registros.
    const conteudo = tabela.map(linha => linha.map(valor => `"${String(valor).replace(/"/g, '""')}"`).join(";")).join("\r\n"); // Converte tudo para o formato CSV.
    const arquivo = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8" }); // Cria o arquivo de texto.
    const url = URL.createObjectURL(arquivo); // Gera um endereço temporário.
    const link = document.createElement("a"); // Cria um elemento de download.
    link.href = url; // Associa o arquivo ao link.
    link.download = "healthfood-financeiro.csv"; // Define o nome do arquivo.
    document.body.appendChild(link); // Adiciona o elemento temporariamente.
    link.click(); // Inicia o download.
    link.remove(); // Remove o elemento da página.
    URL.revokeObjectURL(url); // Libera o endereço temporário.
}); // Finaliza a exportação.

// Insere a data atual no formulário.
definirDataAtual(); // Preenche a data automaticamente.

// Exibe os dados iniciais do painel.
atualizarTudo(); // Inicia a interface com indicadores e tabelas atualizados.
