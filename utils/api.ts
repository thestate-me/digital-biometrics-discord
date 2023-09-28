export const fetchDiscordMessages = async (session: any) => {
  const res = fetch("/api/getDiscordMessages", {
    method: "POST",
    body: JSON.stringify({ session }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
  return res;
};
export const fetchOpenAI = async (session: any, messages: any) => {
  const res = fetch(`/api/generateOpenAI`, {
    method: "POST",
    body: JSON.stringify({
      userName: session.user.name,
      text: messages
        .map((m: any) => `${m.user}@${m.date}: ${m.text}`)
        .join("\n"),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
  return res;
};
export const fetchStore = async (address: any, data: any) => {
  const res = await fetch(`/api/store`, {
    method: "POST",
    body: JSON.stringify({
      address,
      data,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json());
  return res;
};
export const fetchAttests = async (address: any) => {
  const res = await fetch(`/api/get`, {
    method: "POST",
    body: JSON.stringify({
      address,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json());
  return res;
};
