
const request = require("request");

request(
  'https://jsonplaceholder.typicode.com/todos',
  (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }
    const items = JSON.parse(body);
    console.log(items[0]);

    request.patch(
      'https://jsonplaceholder.typicode.com/todos/1',
      {
        json: {
          completed: true
        }
      },
      (error, response, body) => {
        if (error) {
          console.error(error);
          return;
        }
        console.log(body);
    });
  });

request(
  'https://jsonplaceholder.typicode.com/posts',
  (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }
    const items = JSON.parse(body);
    console.log(items[0]);
  }
);