// Funções gerais para a loja
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar contador do carrinho
    atualizarContadorCarrinho();
    
    // Adicionar eventos aos botões "Adicionar ao Carrinho"
    document.querySelectorAll('.adicionar-carrinho').forEach(button => {
        button.addEventListener('click', adicionarAoCarrinho);
    });
    
    // Configurar formulários
    if (document.getElementById('form-login')) {
        document.getElementById('form-login').addEventListener('submit', fazerLogin);
    }
    
    if (document.getElementById('form-cadastro')) {
        document.getElementById('form-cadastro').addEventListener('submit', cadastrarUsuario);
    }
    
    if (document.getElementById('form-contato')) {
        document.getElementById('form-contato').addEventListener('submit', enviarMensagem);
    }
    
    // Configurar carrinho
    if (document.getElementById('metodo-envio')) {
        document.getElementById('metodo-envio').addEventListener('change', calcularTotal);
        carregarCarrinho();
    }
    
    if (document.getElementById('finalizar-compra')) {
        document.getElementById('finalizar-compra').addEventListener('click', finalizarCompra);
    }
});

// Funções do Carrinho
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function adicionarAoCarrinho(event) {
    const button = event.target;
    const id = button.getAttribute('data-id');
    const produto = {
        id: id,
        nome: button.parentElement.querySelector('h3').textContent,
        preco: parseFloat(button.parentElement.querySelector('.preco').textContent.replace('R$ ', '').replace(',', '.')),
        quantidade: 1
    };
    
    const itemExistente = carrinho.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push(produto);
    }
    
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    
    alert('Produto adicionado ao carrinho!');
}

function atualizarContadorCarrinho() {
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    document.querySelectorAll('#cart-count').forEach(element => {
        element.textContent = totalItens;
    });
}

function carregarCarrinho() {
    const tbody = document.getElementById('carrinho-itens');
    tbody.innerHTML = '';
    
    carrinho.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>R$ ${item.preco.toFixed(2).replace('.', ',')}</td>
            <td>
                <input type="number" min="1" value="${item.quantidade}" 
                       data-id="${item.id}" class="quantidade-produto">
            </td>
            <td>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</td>
            <td><button class="remover-item" data-id="${item.id}">Remover</button></td>
        `;
        tbody.appendChild(tr);
    });
    
    // Adicionar eventos aos inputs de quantidade
    document.querySelectorAll('.quantidade-produto').forEach(input => {
        input.addEventListener('change', atualizarQuantidade);
    });
    
    // Adicionar eventos aos botões de remover
    document.querySelectorAll('.remover-item').forEach(button => {
        button.addEventListener('click', removerItem);
    });
    
    calcularTotal();
}

function atualizarQuantidade(event) {
    const input = event.target;
    const id = input.getAttribute('data-id');
    const novaQuantidade = parseInt(input.value);
    
    const item = carrinho.find(item => item.id === id);
    if (item) {
        item.quantidade = novaQuantidade;
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        calcularTotal();
    }
}

function removerItem(event) {
    const button = event.target;
    const id = button.getAttribute('data-id');
    
    carrinho = carrinho.filter(item => item.id !== id);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    carregarCarrinho();
    atualizarContadorCarrinho();
}

function calcularTotal() {
    const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    
    let frete = 0;
    const metodoEnvio = document.getElementById('metodo-envio').value;
    
    if (metodoEnvio === 'correios') {
        frete = 15;
    } else if (metodoEnvio === 'expresso') {
        frete = 25;
    }
    
    const total = subtotal + frete;
    
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('frete').textContent = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function finalizarCompra() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    // Verificar se o usuário está logado
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    
    if (!usuarioLogado) {
        if (confirm('Você precisa estar logado para finalizar a compra. Deseja fazer login agora?')) {
            window.location.href = 'login.html?redirect=carrinho.html';
        }
        return;
    }
    
    // Processar pagamento (simulação)
    alert('Compra finalizada com sucesso! Obrigado por comprar conosco.');
    
    // Limpar carrinho
    carrinho = [];
    localStorage.removeItem('carrinho');
    atualizarContadorCarrinho();
    
    // Redirecionar para página inicial
    window.location.href = 'index.html';
}

// Funções de Autenticação
function fazerLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;
    
    // Simulação de verificação (em um sistema real, seria uma chamada à API)
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        
        // Verificar se há redirecionamento
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        
        if (redirect) {
            window.location.href = redirect;
        } else {
            window.location.href = 'index.html';
        }
    } else {
        alert('Email ou senha incorretos!');
    }
}

function cadastrarUsuario(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome-completo').value;
    const email = document.getElementById('email-cadastro').value;
    const senha = document.getElementById('senha-cadastro').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const cpf = document.getElementById('cpf').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;
    
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }
    
    // Verificar se o usuário já existe
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioExistente = usuarios.find(u => u.email === email);
    
    if (usuarioExistente) {
        alert('Este email já está cadastrado!');
        return;
    }
    
    // Criar novo usuário
    const novoUsuario = {
        nome,
        email,
        senha,
        cpf,
        telefone,
        endereco
    };
    
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    alert('Cadastro realizado com sucesso! Faça login para continuar.');
    window.location.href = 'login.html';
}

function enviarMensagem(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const assunto = document.getElementById('assunto').value;
    const mensagem = document.getElementById('mensagem').value;
    
    // Simulação de envio (em um sistema real, seria uma chamada à API)
    const mensagens = JSON.parse(localStorage.getItem('mensagens')) || [];
    
    mensagens.push({
        nome,
        email,
        assunto,
        mensagem,
        data: new Date().toISOString()
    });
    
    localStorage.setItem('mensagens', JSON.stringify(mensagens));
    
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    document.getElementById('form-contato').reset();
}