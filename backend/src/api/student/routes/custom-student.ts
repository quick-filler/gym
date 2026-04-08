/**
 * Custom student routes.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/students/me',
      handler: 'student.me',
      config: {
        auth: true,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
