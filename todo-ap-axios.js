const axios = require('axios');

axios.get('https://jsonplaceholder.typicode.com/todos')
  .then(response => {
    const item = response.data[0];
    console.log(item);
    return axios.patch(`https://jsonplaceholder.typicode.com/todos/${item.id}`, {
      completed: true
    });
  })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });