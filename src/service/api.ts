import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5555/",
});

// export const api = axios.create({
//   baseURL: "https://api.portalpalhoca.com.br/",
// });

export const api_cep = axios.create({
  baseURL: "https://viacep.com.br/ws/",
});
