const axios = require('axios');

async function fetchTodo() {
  const todos = await axios.get('https://jsonplaceholder.typicode.com/todos');
  const item = todos.data[0];
  console.log(item);

  const res2 = await axios.request({
    method: 'PATCH',
    url: `https://jsonplaceholder.typicode.com/todos/${item.id}`,
    data: {
      completed: true
    }
  });
  console.log(res2.data);
}

fetchTodo();