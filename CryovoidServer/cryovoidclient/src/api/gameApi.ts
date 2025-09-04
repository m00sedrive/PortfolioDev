import axios from "axios";

const API_URL = "https://localhost:7112/api/game";

export async function newGame() {
  const res = await axios.post(`${API_URL}/create`);
  return res.data;
}

export async function getGame(id: string) {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
}
