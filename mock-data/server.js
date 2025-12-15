// Servidor customizado para mock com suporte a login
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Middleware CORS para permitir requisições do frontend
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Responder OPTIONS preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Adicionar delay para simular latência de rede
server.use((req, res, next) => {
  setTimeout(next, 500);
});

// Middleware para parsear JSON
server.use(jsonServer.bodyParser);

// Função auxiliar para processar login
const handleLogin = (req, res) => {
  const { email, password } = req.body;

  console.log("🔐 Tentativa de login:", { email, password: "***" });

  // Credenciais mockadas
  const validUsers = [
    {
      email: "mr.andersonpaulo@gmail.com",
      password: "123456",
      user: {
        id: "user-1",
        name: "Paulo Anderson",
        email: "mr.andersonpaulo@gmail.com",
        role: {
          id: "role-4",
          name: "Administrador",
        },
        user_image: {
          id: "img-1",
          url: "https://i.pravatar.cc/150?img=1",
        },
      },
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEiLCJlbWFpbCI6Im1yLmFuZGVyc29ucGF1bG9AZ21haWwuY29tIiwicm9sZSI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE3MDI2NTAwMDAsImV4cCI6MTcwMjgyMjgwMH0.mock-jwt-token-for-development",
    },
    {
      email: "admin@portalpalhoca.com.br",
      password: "admin123",
      user: {
        id: "user-admin",
        name: "Administrador",
        email: "admin@portalpalhoca.com.br",
        role: {
          id: "role-4",
          name: "Administrador",
        },
        user_image: {
          id: "img-admin",
          url: "https://i.pravatar.cc/150?img=10",
        },
      },
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLWFkbWluIiwiZW1haWwiOiJhZG1pbkBwb3J0YWxwYWxob2NhLmNvbS5iciIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzAyNjUwMDAwLCJleHAiOjE3MDI4MjI4MDB9.mock-jwt-token-admin",
    },
  ];

  // Validar credenciais
  const user = validUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    console.log("✅ Login bem-sucedido:", user.user.name);
    return res.status(200).json({
      token: user.token,
      user: user.user,
    });
  } else {
    console.log("❌ Login falhou - credenciais inválidas");
    return res.status(401).json({
      message: "Email ou senha incorretos",
    });
  }
};

// Middleware customizado para login (ambos os endpoints /login e /api/login)
server.post("/login", handleLogin);
server.post("/api/login", handleLogin);

// Endpoint de perfil do usuário
server.get("/profile", (req, res) => {
  const token = req.headers.authorization;

  console.log(
    "👤 Requisição de perfil, token:",
    token ? "Presente" : "Ausente"
  );

  if (!token) {
    console.log("❌ Perfil falhou - sem token");
    return res.status(401).json({
      message: "Token não fornecido",
    });
  }

  // Mock: sempre retorna o mesmo usuário para qualquer token válido
  const mockProfile = {
    id: "user-1",
    name: "Paulo Anderson",
    email: "mr.andersonpaulo@gmail.com",
    isActive: true,
    role: {
      id: "role-4",
      name: "Administrador",
    },
    user_image: {
      id: "img-1",
      url: "https://i.pravatar.cc/150?img=1",
    },
  };

  console.log("✅ Perfil retornado:", mockProfile.name);
  return res.status(200).json({
    response: mockProfile,
  });
});

server.get("/api/profile", (req, res) => {
  const token = req.headers.authorization;

  console.log(
    "👤 Requisição de perfil (API), token:",
    token ? "Presente" : "Ausente"
  );

  if (!token) {
    console.log("❌ Perfil falhou - sem token");
    return res.status(401).json({
      message: "Token não fornecido",
    });
  }

  // Mock: sempre retorna o mesmo usuário para qualquer token válido
  const mockProfile = {
    id: "user-1",
    name: "Paulo Anderson",
    email: "mr.andersonpaulo@gmail.com",
    isActive: true,
    role: {
      id: "role-4",
      name: "Administrador",
    },
    user_image: {
      id: "img-1",
      url: "https://i.pravatar.cc/150?img=1",
    },
  };

  console.log("✅ Perfil retornado:", mockProfile.name);
  return res.status(200).json({
    response: mockProfile,
  });
});

// Endpoint para listar artigos do autor
server.get("/article-author", (req, res) => {
  const db = router.db;
  const articles = db.get("articles").value();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedArticles = articles.slice(startIndex, endIndex);

  console.log(
    `📝 Requisição de artigos do autor - Página ${page}, Limite ${limit}`
  );

  return res.status(200).json({
    message: "Artigos listados com sucesso",
    data: paginatedArticles,
    meta: {
      page,
      limit,
      total: articles.length,
      totalPages: Math.ceil(articles.length / limit),
    },
  });
});

server.get("/api/article-author", (req, res) => {
  const db = router.db;
  const articles = db.get("articles").value();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedArticles = articles.slice(startIndex, endIndex);

  console.log(
    `📝 Requisição de artigos do autor (API) - Página ${page}, Limite ${limit}`
  );

  return res.status(200).json({
    message: "Artigos listados com sucesso",
    data: paginatedArticles,
    meta: {
      page,
      limit,
      total: articles.length,
      totalPages: Math.ceil(articles.length / limit),
    },
  });
});

// Endpoint para listar empresas com paginação
server.get("/company", (req, res) => {
  const db = router.db;
  const companies = db.get("companies").value();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCompanies = companies.slice(startIndex, endIndex);

  console.log(`🏢 Requisição de empresas - Página ${page}, Limite ${limit}`);

  return res.status(200).json({
    data: paginatedCompanies,
    total: companies.length,
    page,
    limit,
    totalPages: Math.ceil(companies.length / limit),
  });
});

server.get("/api/company", (req, res) => {
  const db = router.db;
  const companies = db.get("companies").value();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCompanies = companies.slice(startIndex, endIndex);

  console.log(
    `🏢 Requisição de empresas (API) - Página ${page}, Limite ${limit}`
  );

  return res.status(200).json({
    data: paginatedCompanies,
    total: companies.length,
    page,
    limit,
    totalPages: Math.ceil(companies.length / limit),
  });
});

// Endpoint para listar usuários com paginação
server.get("/user", (req, res) => {
  const db = router.db;
  const users = db.get("users").value();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = users.slice(startIndex, endIndex);

  console.log(`👥 Requisição de usuários - Página ${page}, Limite ${limit}`);

  return res.status(200).json({
    response: {
      data: paginatedUsers,
      total: users.length,
      page,
      limit,
      totalPages: Math.ceil(users.length / limit),
    },
  });
});

server.get("/api/user", (req, res) => {
  const db = router.db;
  const users = db.get("users").value();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = users.slice(startIndex, endIndex);

  console.log(
    `👥 Requisição de usuários (API) - Página ${page}, Limite ${limit}`
  );

  return res.status(200).json({
    response: {
      data: paginatedUsers,
      total: users.length,
      page,
      limit,
      totalPages: Math.ceil(users.length / limit),
    },
  });
});

// Endpoint para artigos em destaque por portal
server.get("/highlights-by-portal", (req, res) => {
  const db = router.db;
  const articles = db.get("articles").value();
  const role = req.query.role;

  console.log(`⭐ Requisição de destaques por portal - Role: ${role}`);

  // Filtrar artigos em destaque
  const highlights = articles.filter((a) => a.highlight === true);

  return res.status(200).json({
    response: highlights,
  });
});

server.get("/api/highlights-by-portal", (req, res) => {
  const db = router.db;
  const articles = db.get("articles").value();
  const role = req.query.role;

  console.log(`⭐ Requisição de destaques por portal (API) - Role: ${role}`);

  // Filtrar artigos em destaque
  const highlights = articles.filter((a) => a.highlight === true);

  return res.status(200).json({
    response: highlights,
  });
});

// Middleware para verificar token (opcional, para outras rotas)
server.use("/api/*", (req, res, next) => {
  // Pular verificação para rotas públicas
  if (req.path === "/api/login") {
    return next();
  }

  // Verificar se tem token no header
  const token = req.headers.authorization;

  if (!token && req.method !== "GET") {
    console.log("⚠️  Sem token no header Authorization");
  }

  next();
});

// Usar middlewares padrão do json-server
server.use(middlewares);

// Reescrever rotas para adicionar /api
server.use(
  jsonServer.rewriter({
    "/api/*": "/$1",
  })
);

// Usar router do json-server
server.use(router);

// Iniciar servidor
const PORT = 5555;
server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("🚀 Mock API Server rodando!");
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log("");
  console.log("📝 Endpoints disponíveis:");
  console.log("   POST /login - Login (direto)");
  console.log("   POST /api/login - Login (com prefixo)");
  console.log("   GET  /profile - Perfil do usuário (direto)");
  console.log("   GET  /api/profile - Perfil do usuário (com prefixo)");
  console.log("   GET  /api/articles - Artigos");
  console.log("   GET  /api/users - Usuários");
  console.log("   GET  /api/companies - Empresas");
  console.log("   GET  /api/banners - Banners");
  console.log("");
  console.log("🔑 Credenciais de teste:");
  console.log("   Email: mr.andersonpaulo@gmail.com");
  console.log("   Senha: 123456");
  console.log("");
  console.log("   Email: admin@portalpalhoca.com.br");
  console.log("   Senha: admin123");
  console.log("");
});
