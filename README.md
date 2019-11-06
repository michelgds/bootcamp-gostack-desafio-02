
# bootcamp-gostack-desafio-02 - Gympoint
App back-end gerenciador de academia

# Aplicação utiliza:

NodeJs + Express;
Sucrase + Nodemon;
ESLint + Prettier + EditorConfig;
Sequelize + PostgreSQL + MongoDB;
Redis, Bee-queue, Nodemailer
Docker

# Gympoint
Gympoint, um App gerenciador de academia.

Durante esse desafio aprimoramos a aplicação Gympoint que demos início no desafio anterior implementando funcionalidades que aprendemos durante as aulas do Bootcamp da RocketSeat até agora.

### Funcionalidades do administrador

Abaixo estão descritas as funcionalidades que foram adicionadas na aplicação para administradores.

#### 1. Gestão de planos

Permite que o usuário possa cadastrar planos para matrícula de alunos, o plano possui os seguintes campos:

- title (nome do plano);
- duration (duração em número de meses);
- price (preço mensal do plano);

Exemplo de requisição:
```js
{
	"title": "Start",
	"duration": 1,
	"price": 129.00
}

```

É possível criar planos como por exemplo:

- `Start`: Plano de 1 mês por R\$129;
- `Gold`: Plano de 3 meses por R\$109/mês;
- `Diamond`: Plano de 6 meses por R\$89/mês;

Existem rotas para listagem/cadastro/atualização/remoção de planos;

Obs.: Essa funcionalidade é para administradores autenticados na aplicação.

#### 2. Gestão de matrículas

O aluno pode criar uma matrícula para poder acessar a academia.

Nessa funcionalidade existe um cadastro de matrículas por aluno, a matrícula possui os campos:

- student_id (referência ao aluno);
- plan_id (referência ao plano);
- start_date (data de início da matrícula);
- end_date (date de término da matrícula);
- price (preço total calculado na data da matrícula);

A **data de início** da matrícula deve ser escolhida pelo usuário.

A **data de término** e **preço** da matrícula é calculada com base no plano selecionado, por exemplo:

Data de início informada: `23/05/2019`
Plano selecionado: `Gold (3 meses)`
Data de término calculada: `23/08/2019 (3 meses depois do início)`
Preço calculado: `R$327`

Quando um aluno **realiza uma matrícula** ele recebe um e-mail com detalhes da sua inscrição na academia como plano, data de término, valor e uma mensagem de boas-vidas.

Existem rotas para listagem/cadastro/atualização/remocação de matrículas;

Obs.: Essa funcionalidade é para administradores autenticados na aplicação.

### Funcionalidades do aluno

Abaixo estão descritas as funcionalidades adicionadas para alunos.

#### 1. Checkins

Quando o aluno chega na academia o mesmo realiza um check-in apenas informando seu ID de cadastro (ID do banco de dados);

Esse check-in serve para monitorar quantas vezes o usuário frequentou a academia na semana.

A tabela de `checkins` possui os campos:

- student_id (referência ao aluno);
- created_at;
- updated_at;

O usuário só pode fazer **5 checkins** dentro de um período de 7 dias corridos.

Exemplo de requisição: `POST https://gympoint.com/students/3/checkins`

Existe uma rota para listagem de todos checkins realizados por um usuário com base em seu ID de cadastro;

Exemplo de requisição: `GET https://gympoint.com/students/3/checkins`

#### 2. Pedidos de auxílio

O aluno pode criar pedidos de auxílio para a academia em relação a algum exercício, alimentação ou instrução qualquer;

A tabela `help_orders` contém os seguintes campos:

- student_id (referência ao aluno);
- question (pergunta do aluno em texto);
- answer (resposta da academia em texto);
- answer_at (data da resposta da academia);

Existe uma rota para a academia listar todos pedidos de auxílio sem resposta;

Existe ainda uma rota para o aluno cadastrar pedidos de auxílio apenas informando seu ID de cadastro (ID do banco de dados);

Exemplo de requisição: `POST https://gympoint.com/students/3/help-orders`

Há uma rota para listar todos pedidos de auxílio de um usuário com base em seu ID de cadastro;

Exemplo de requisição: `GET https://gympoint.com/students/3/help-orders`

Há também uma rota para a academia responder um pedido de auxílio:

Exemplo de requisição: `POST https://gympoint.com/help-orders/1/answer`

Quando um pedido de auxílio for respondido, o aluno recebe um e-mail da plataforma com a pergunta e resposta da academia;

