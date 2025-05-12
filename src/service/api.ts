import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5555/",
});


export const api_cep = axios.create({
  baseURL: "https://viacep.com.br/ws/", 
});