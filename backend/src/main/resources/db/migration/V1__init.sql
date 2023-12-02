CREATE TABLE users (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  country VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL
);

CREATE TABLE roles (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE users_roles (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_role_id FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE tokens (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  token VARCHAR(255) UNIQUE NOT NULL,
  token_type VARCHAR(255) NOT NULL,
  revoked BOOLEAN NOT NULL,
  expired BOOLEAN NOT NULL,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_tokens_users FOREIGN KEY (user_id) REFERENCES users(id)
);