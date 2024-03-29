const AUTH_SERVICE = "http://localhost:8081";
const CHAT_SERVICE = "http://localhost:8080";

export const saveUser = (data) => {
  return fetch(CHAT_SERVICE + '/signup', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then((response) =>
      response.json().then((json) => {
        if (!response.ok) {
          return Promise.reject(json);
        }
        return json;
      })
    )
}

export const changeStatus = (id, isOnline) => {
  return fetch(CHAT_SERVICE + '/users/status/' + id + '/' + (isOnline ? 1 : 0))
    .then((response) =>
      response.json().then((json) => {
        if (!response.ok) {
          return Promise.reject(json);
        }
        return json;
      })
    )
}


export const getAllUsersWithoutMe = (id) => {
  return fetch(CHAT_SERVICE + '/users/without/' + id)
    .then((response) =>
      response.json().then((json) => {
        if (!response.ok) {
          return Promise.reject(json);
        }
        return json;
      })
    )
}



export const login = (username) => {
  return fetch(CHAT_SERVICE + '/login/' + username)
    .then((response) =>
      response.json().then((json) => {
        if (!response.ok) {
          return Promise.reject(json);
        }
        return json;
      })
    )
}

const request = (options) => {
  const headers = new Headers();

  if (options.setContentType !== false) {
    headers.append("Content-Type", "application/json");
  }

  const defaults = {
    headers: headers
  };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options).then((response) =>
    response.json().then((json) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      return json;
    })
  );
};


export function getUserById(id) {

  return request({
    url: CHAT_SERVICE + "/users/" + id,
    method: "GET",
  });
}

export function countNewMessages(senderId, recipientId) {

  return request({
    url: CHAT_SERVICE + "/messages/" + senderId + "/" + recipientId + "/count",
    method: "GET",
  });
}

export function findChatMessages(senderId, recipientId) {
  return request({
    url: CHAT_SERVICE + "/messages/" + senderId + "/" + recipientId,
    method: "GET",
  });
}

export function findChatMessage(id) {
  return request({
    url: CHAT_SERVICE + "/messages/" + id,
    method: "GET",
  });
}

export function saveMessage(data) {
  return fetch(CHAT_SERVICE + '/messages/save', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then((response) =>
    response.json().then((json) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      return json;
    })
  )
}

export function changeMessageStatus(id, status) {
  return fetch(CHAT_SERVICE + '/messages/status/change/' + id + '/' + status)
  .then((response) =>
    response.json().then((json) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      return json;
    })
  )
}

export function uploadFiles(files) {
  const formData = new FormData();
  formData.set('files', files);
  return fetch(CHAT_SERVICE + '/messages/upload-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    body: formData
  })
  .then((response) =>
    response.json().then((json) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      return json;
    })
  )

}
