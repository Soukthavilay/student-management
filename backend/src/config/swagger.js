import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Student Management API",
      version: "1.0.0",
      description:
        "REST API cho hệ thống quản lý sinh viên mobile + admin web + giảng viên nhập điểm",
    },
    tags: [
      { name: "Auth" },
      { name: "Student" },
      { name: "Admin" },
      { name: "Lecturer" },
      { name: "Notification" },
    ],
    paths: {
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Đăng nhập",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: { description: "Đăng nhập thành công" },
            401: { description: "Sai thông tin đăng nhập" },
          },
        },
      },
      "/api/student/grades": {
        get: {
          tags: ["Student"],
          summary: "Xem bảng điểm sinh viên",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Trả về bảng điểm" },
            401: { description: "Chưa xác thực" },
          },
        },
      },
      "/api/admin/lecturers": {
        get: {
          tags: ["Admin"],
          summary: "Danh sách giảng viên",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Danh sách giảng viên" },
          },
        },
        post: {
          tags: ["Admin"],
          summary: "Tạo giảng viên",
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: "Tạo thành công" },
          },
        },
      },
      "/api/lecturer/grades": {
        put: {
          tags: ["Lecturer"],
          summary: "Nhập/cập nhật điểm sinh viên",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Lưu điểm thành công" },
          },
        },
      },
      "/api/notifications/register-device": {
        post: {
          tags: ["Notification"],
          summary: "Đăng ký device token để nhận push",
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: "Đăng ký thành công" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
