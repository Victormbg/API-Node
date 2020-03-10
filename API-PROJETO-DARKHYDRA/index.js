const express = require('express');
const bparser = require('body-parser');
const mysql   = require('mysql');
const cors    = require('cors');

const app     = express();
const port    = process.env.PORT || 8080;

var conn      = mysql.createConnection({
  host: '',
  user: '',
  password: '',
  database: ''
});

function handleDisconnect() {
  conn.on('error', function(err){
    if(!err.fatal) {
      return;
    }

    if(err.code !== 'PROTOCOL_CONNECTION_LOST'){
      throw err;
    }

    console.log('\nRe-connecting lost connection: ' +err.stack);
    conn = mysql.createConnection(conn.config);

    handleDisconnect(conn);
    conn.connect();
  });
}

handleDisconnect(conn);

app.use(bparser.urlencoded({ extended : false}));
app.use(bparser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify({Erro: "caminho inválido, use /jogos ou /user"}, null, 5));
});

app.get('/jogos', (req, res) => {
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify({Erro: "caminho inválido, use jogos/t ou jogos/p ou jogos/m"}, null, 5));
})

app.get('/user', (req, res) => {
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify({Erro: "caminho inválido, use user/l"}, null, 5));
});

app.get('/user/perfil', (req, res) => {
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify({Erro: "caminho inválido, use user/perfil/t ou user/perfil/p ou user/perfil/seguidor/a user/perfil/seguidor/b user/perfil/seguidor/m"}, null, 5));
});

app.get('/jogos/t', function(req, res) {
  conn.query('SELECT idJogo, tituloJogo, descJogo, tagsJogo, imagem1, imagem2, imagem3, imagem4 FROM jogo',(err,rows) => {
    if(err) throw err;

    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/jogos/p', function(req, res) {
  let id = req.query.id;

  if(isNaN(id)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({Erro: "id é NaN ou não especificado"}, null, 5));
  } else {
    conn.query('SELECT idJogo, tituloJogo, descJogo, tagsJogo, imagem1, imagem2, imagem3, imagem4, zipJogo, pathExec, produtora, nomePerfil FROM jogo INNER JOIN perfil ON produtora = idPerfil WHERE idJogo = '+id,(err,rows) => {
      if(err) throw err;
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(rows[0], null, 5));
    });
  }

});

app.get('/jogos/m', function(req, res) {
  let user = req.query.u;

  if(isNaN(user)) {
    res.header("Content-Type{", "application/json");
    res.send(JSON.stringify({Erro: "id especifícado é NaN"}, null, 5));
  } else {
    conn.query('SELECT jogo_usuario.idJogo, jogo.tituloJogo, jogo.imagem1, jogo.imagem2, jogo.imagem3, jogo.imagem4 FROM jogo_usuario INNER JOIN jogo ON jogo.idJogo = jogo_usuario.idJogo AND jogo_usuario.idUsuario = '+user+' GROUP BY jogo_usuario.idJogo;', (err,rows) => {
      if(err) throw err;
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(rows, null, 5));
    });
  }
});

app.get('/jogos/e', function(req, res) {
  let user = req.query.u;

  if(isNaN(user)) {
    res.header("Content-Type{", "application/json");
    res.send(JSON.stringify({Erro: "id especifícado é NaN"}, null, 5));
  } else {
    conn.query('SELECT idJogo, tituloJogo, imagem1, imagem2 FROM jogo WHERE produtora = '+user, (err,rows) => {
      if(err) throw err;
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(rows, null, 5));
    });
  }
});

app.get('/jogos/d', function(req, res) {
  conn.query('SELECT jogo_usuario.idJogo, COUNT(*) AS downloads, jogo.tituloJogo, jogo.descJogo, jogo.tagsJogo, jogo.imagem1, jogo.imagem2, jogo.imagem3, jogo.imagem4 FROM jogo_usuario INNER JOIN jogo ON jogo.idJogo = jogo_usuario.idJogo GROUP BY jogo_usuario.idJogo ORDER BY downloads DESC LIMIT 3 ', (err,rows) => {
    if(err) throw err;

    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/jogos/comentario', function(req, res) {
  let jogo = req.query.id;

  if(isNaN(jogo)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({Erro: "id especifícado é NaN"}, null, 5));
  } else {
    conn.query('SELECT idComentario, idJogo, comentario.idPerfil, comentario, tipoComentario, nomePerfil, imagemPerfil FROM comentario INNER JOIN perfil ON comentario.idPerfil = perfil.idPerfil WHERE idJogo = '+jogo, (err,rows) => {
      if(err) throw err;

      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(rows, null, 5));
    });
  }
});

app.get('/user/perfil/t', function(req, res) {
  conn.query('SELECT idPerfil, nomePerfil, nomeUsuario, descricaoPerfil, imagemPerfil, destaquePerfil, tipoUsuario FROM perfil INNER JOIN usuario ON perfil.idPerfil = usuario.idUsuario;',(err,rows) => {
    if(err) throw err;
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/user/perfil/p', function(req, res) {
  let user = req.query.u;

  if(isNaN(user)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({Erro: "id especifícado é NaN"}, null, 5));
  } else {
    conn.query('SELECT idPerfil, nomePerfil, descricaoPerfil, imagemPerfil, destaquePerfil, tipoUsuario FROM perfil INNER JOIN usuario ON idPerfil = idUsuario WHERE idPerfil = '+user,(err,rows) => {
      if(err) throw err;
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(rows[0], null, 5));
    });
  }
});

app.get('/user/perfil/seguidor/sigo', function(req, res) {
  let user = req.query.u;

  if(isNaN(user)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({Erro: "id especifícado é NaN"}, null, 5));
  } else {
    conn.query('SELECT idRelacao, idSeguido, nomePerfil, descricaoPerfil, imagemPerfil, destaquePerfil FROM seguidor INNER JOIN perfil ON perfil.idPerfil = seguidor.idSeguido WHERE idSeguidor = '+user,(err,rows) => {
      if(err) throw err;

      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(rows, null, 5));
    });
  }
});

app.get('/user/perfil/seguidor/seguem', function(req, res) {
  let user = req.query.u;

  if(isNaN(user)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({Erro: "id especifícado é NaN"}, null, 5));
  } else {
    conn.query('SELECT idSeguidor, nomePerfil, descricaoPerfil, imagemPerfil, destaquePerfil FROM seguidor INNER JOIN perfil ON perfil.idPerfil = seguidor.idSeguidor WHERE idSeguido = '+user,(err,rows) => {
      if(err) throw err;
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(rows, null, 5));
    });
  }
});

app.get('/user/perfil/seguidor/mutuo', function(req, res) {
  let user = req.query.u;

  if(isNaN(user)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({Erro: "id especifícado é NaN"}, null, 5));
  } else {
    conn.query('SELECT idSeguido, nomePerfil, descricaoPerfil, imagemPerfil, destaquePerfil FROM seguidor INNER JOIN perfil ON idSeguido = perfil.idPerfil  WHERE idSeguidor = '+user+' AND idSeguido IN (SELECT idSeguidor FROM seguidor WHERE idSeguido = '+user+')',(err,rows) => {
      if(err) throw err;

      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(rows, null, 5));
    });
  }
});

app.get('/user/l', function(req, res) {
  var login = req.query.login;
  var senha = req.query.senha;

  conn.query('SELECT idUsuario FROM usuario WHERE nomeUsuario = \"'+login+'\" AND senhaUsuario = \"'+senha+'\"', (err,rows) => {
    if(err) throw err;
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/gestao/faleconosco/new', function(req, res) {
  conn.query('SELECT idMensagem, idSender as idPerfil, topico, mensagem, nomePerfil, nomeUsuario, imagemPerfil, emailUsuario FROM faleconosco INNER JOIN perfil ON perfil.idPerfil = idSender INNER JOIN usuario ON idPerfil = idUsuario WHERE visualizado = 0', (err,rows) => {
    if(err) throw err;
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/gestao/faleconosco/old', function(req, res) {
  conn.query('SELECT idMensagem, idSender as idPerfil, topico, mensagem, nomePerfil, nomeUsuario, imagemPerfil, emailUsuario FROM faleconosco INNER JOIN perfil ON perfil.idPerfil = idSender INNER JOIN usuario ON idPerfil = idUsuario WHERE visualizado = 1 ORDER BY idMensagem DESC', (err,rows) => {
    if(err) throw err;
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/gestao/denuncias/new', function(req, res) {
  conn.query('SELECT idDenuncia, idDenunciante, p1.nomePerfil AS nomeDenunciante, u1.nomeUsuario AS userDenunciante, p1.imagemPerfil AS fotoDenunciante,  idDenunciado, p2.nomePerfil AS nomeDenunciado, u2.nomeUsuario AS userDenunciado, p2.imagemPerfil AS imagemDenunciado, topico, mensagem FROM denuncias INNER JOIN perfil AS p1 ON idDenunciante = p1.idPerfil INNER JOIN usuario AS u1 ON u1.idUsuario = idDenunciante INNER JOIN perfil AS p2 ON idDenunciado = p2.idPerfil INNER JOIN usuario AS u2 ON u2.idUsuario = idDenunciado WHERE visualizado = 0', (err,rows) => {
    if(err) throw err;
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/gestao/denuncias/old', function(req, res) {
  conn.query('SELECT idDenuncia, idDenunciante, p1.nomePerfil AS nomeDenunciante, u1.nomeUsuario AS userDenunciante, p1.imagemPerfil AS fotoDenunciante,  idDenunciado, p2.nomePerfil AS nomeDenunciado, u2.nomeUsuario AS userDenunciado, p2.imagemPerfil AS imagemDenunciado, topico, mensagem FROM denuncias INNER JOIN perfil AS p1 ON idDenunciante = p1.idPerfil INNER JOIN usuario AS u1 ON u1.idUsuario = idDenunciante INNER JOIN perfil AS p2 ON idDenunciado = p2.idPerfil INNER JOIN usuario AS u2 ON u2.idUsuario = idDenunciado WHERE visualizado = 1 ORDER BY idDenuncia DESC', (err,rows) => {
    if(err) throw err;
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/gestao/devs/new', function(req, res) {
  conn.query('SELECT idUsuario, nomeUsuario, emailUsuario, razaoSocial, cnpj FROM usuario WHERE tipoUsuario = "desenvolvedor" AND ativado = 0', (err,rows) => {
    if(err) throw err;
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/gestao/devs/old', function(req, res) {
  conn.query('SELECT idUsuario, nomeUsuario, emailUsuario, razaoSocial, cnpj FROM usuario WHERE tipoUsuario = "desenvolvedor" AND ativado = 1 ORDER BY idUsuario DESC', (err,rows) => {
    if(err) throw err;
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/gestao/jogos/new', function(req, res) {
  conn.query('SELECT pedidos.*, idUsuario, emailUsuario, razaoSocial, cnpj FROM pedidos INNER JOIN usuario ON produtora = idUsuario WHERE pedidos.ativado = 0 ORDER BY idPedido DESC', (err,rows) => {
    if(err) throw err;
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.get('/gestao/jogos/old', function(req, res) {
  conn.query('SELECT pedidos.*, idUsuario, emailUsuario, razaoSocial, cnpj FROM pedidos INNER JOIN usuario ON produtora = idUsuario WHERE pedidos.ativado = 1', (err,rows) => {
    if(err) throw err;
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(rows, null, 5));
  });
});

app.listen(port, () => {
  console.log('Running on '+port+'.');
});
