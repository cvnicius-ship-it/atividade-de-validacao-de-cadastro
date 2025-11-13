
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = 3000;


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'chave-secreta-simples',
    resave: false,
    saveUninitialized: false
}));


let fornecedores = [];


const USUARIO_VALIDO = 'admin';
const SENHA_VALIDA = '1234';


function verificarLogin(req, res, next) {
    req.logado = req.session.logado || false;
    next();
}
app.use(verificarLogin);


function gerarMenu(logado) {
    return `
        <div class="menu">
            <a href="/">Início</a>
            <a href="/cadastro-fornecedor">Cadastro Fornecedor</a>
            <a href="/cadastro-cliente">Cadastro Cliente</a>
            ${logado 
                ? '<a href="/logout" class="logout">Logout</a>' 
                : '<a href="/login">Login</a>'
            }
        </div>
    `;
}


app.get('/', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Sistema</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <div class="container">
                ${gerarMenu(req.logado)}
                <h1>Bem-vindo ao Sistema de Cadastro</h1>
                <p>Use o menu acima para navegar.</p>
            </div>
        </body>
        </html>
    `;
    res.send(html);
});


app.get('/login', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Login</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <div class="container">
                ${gerarMenu(req.logado)}
                <h2>Login</h2>
                <form method="POST" action="/login">
                    <label>Usuário:</label>
                    <input type="text" name="usuario" required>
                    <label>Senha:</label>
                    <input type="password" name="senha" required>
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </body>
        </html>
    `;
    res.send(html);
});


app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === USUARIO_VALIDO && senha === SENHA_VALIDA) {
        req.session.logado = true;
        req.session.usuario = usuario;
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Login OK</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <div class="container">
                    ${gerarMenu(true)}
                    <p class="success">Login realizado com sucesso!</p>
                    <p><a href="/">Voltar ao início</a></p>
                </div>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Erro</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <div class="container">
                    ${gerarMenu(req.logado)}
                    <p class="error">Usuário ou senha inválidos.</p>
                    <p><a href="/login">Tentar novamente</a></p>
                </div>
            </body>
            </html>
        `);
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Logout</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <div class="container">
                ${gerarMenu(false)}
                <h2>Logout efetuado com sucesso!</h2>
                <p><a href="/">Voltar ao início</a></p>
            </div>
        </body>
        </html>
    `);
});


app.get('/cadastro-fornecedor', (req, res) => {
    const erros = req.query.erros ? JSON. Desai.parse(decodeURIComponent(req.query.erros)) : [];
    const dados = req.query.dados ? JSON.parse(decodeURIComponent(req.query.dados)) : {};

    let formErros = '';
    if (erros.length > 0) {
        formErros = '<div class="error"><ul>' + erros.map(e => `<li>${e}</li>`).join('') + '</ul></div>';
    }

    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Cadastro Fornecedor</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <div class="container">
                ${gerarMenu(req.logado)}
                <h2>Cadastro de Fornecedor</h2>
                ${formErros}
                <form method="POST" action="/cadastro-fornecedor">
                    <label>CNPJ:</label>
                    <input type="text" name="cnpj" value="${dados.cnpj || ''}" required>
                    
                    <label>Razão Social:</label>
                    <input type="text" name="razao_social" value="${dados.razao_social || ''}" required>
                    
                    <label>Nome Fantasia:</label>
                    <input type="text" name="nome_fantasia" value="${dados.nome_fantasia || ''}" required>
                    
                    <label>Endereço:</label>
                    <input type="text" name="endereco" value="${dados.endereco || ''}" required>
                    
                    <label>Cidade:</label>
                    <input type="text" name="cidade" value="${dados.cidade || ''}" required>
                    
                    <label>UF:</label>
                    <input type="text" name="uf" value="${dados.uf || ''}" maxlength="2" required>
                    
                    <label>CEP:</label>
                    <input type="text" name="cep" value="${dados.cep || ''}" required>
                    
                    <label>E-mail:</label>
                    <input type="email" name="email" value="${dados.email || ''}" required>
                    
                    <label>Telefone:</label>
                    <input type="text" name="telefone" value="${dados.telefone || ''}" required>
                    
                    <button type="submit">Cadastrar</button>
                </form>

                ${fornecedores.length > 0 ? `
                <h3>Fornecedores Cadastrados</h3>
                <table>
                    <tr>
                        <th>CNPJ</th>
                        <th>Razão Social</th>
                        <th>Nome Fantasia</th>
                        <th>Cidade</th>
                        <th>UF</th>
                        <th>E-mail</th>
                    </tr>
                    ${fornecedores.map(f => `
                    <tr>
                        <td>${f.cnpj}</td>
                        <td>${f.razao_social}</td>
                        <td>${f.nome_fantasia}</td>
                        <td>${f.cidade}</td>
                        <td>${f.uf}</td>
                        <td>${f.email}</td>
                    </tr>`).join('')}
                </table>` : ''}
            </div>
        </body>
        </html>
    `;
    res.send(html);
});


app.post('/cadastro-fornecedor', (req, res) => {
    const dados = req.body;
    const erros = [];

    const campos = [
        'cnpj', 'razao_social', 'nome_fantasia', 'endereco',
        'cidade', 'uf', 'cep', 'email', 'telefone'
    ];

   
    campos.forEach(campo => {
        if (!dados[campo] || dados[campo].trim() === '') {
            erros.push(`O campo ${campo.replace('_', ' ')} é obrigatório.`);
        }
    });

 
    if (dados.cnpj && !/^\d{14}$/.test(dados.cnpj.replace(/\D/g, ''))) {
        erros.push('CNPJ deve ter 14 dígitos numéricos.');
    }
    if (dados.cep && !/^\d{8}$/.test(dados.cep.replace(/\D/g, ''))) {
        erros.push('CEP deve ter 8 dígitos numéricos.');
    }
    if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
        erros.push('E-mail inválido.');
    }
    if (dados.uf && !/^[A-Z]{2}$/.test(dados.uf.toUpperCase())) {
        erros.push('UF deve ter 2 letras maiúsculas (ex: SP).');
    }

    if (erros.length > 0) {
        const queryErros = encodeURIComponent(JSON.stringify(erros));
        const queryDados = encodeURIComponent(JSON.stringify(dados));
        return res.redirect(`/cadastro-fornecedor?erros=${queryErros}&dados=${queryDados}`);
    }

    
    fornecedores.push({
        cnpj: dados.cnpj,
        razao_social: dados.razao_social,
        nome_fantasia: dados.nome_fantasia,
        endereco: dados.endereco,
        cidade: dados.cidade,
        uf: dados.uf.toUpperCase(),
        cep: dados.cep,
        email: dados.email,
        telefone: dados.telefone
    });


    res.redirect('/cadastro-fornecedor');
});


app.get('/cadastro-cliente', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Cliente</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <div class="container">
                ${gerarMenu(req.logado)}
                <h2>Cadastro de Cliente</h2>
                <p>Em breve...</p>
            </div>
        </body>
        </html>
    `);
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});