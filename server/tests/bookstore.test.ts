import { ServerErrorResponse, ServerUnaryCall } from '@grpc/grpc-js';
import describe from 'ava';
import sinon from 'sinon';
import {
  Author,
  Book,
  CreateBookRequest,
  DeleteBookRequest,
  GetBookRequest,
  UpdateBookRequest,
} from '../proto/bookstore_pb';
import DB from '../src/db';
import { getImplementation as booksImpl } from '../src/handlers/bookstore';
import { camelCase } from 'change-case';

var bookPayload: Book.AsObject = {
  id: 'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8',
  title: 'Pensamentos sem sentido de um homem sem ideias',
  description: 'Um portal para minha mente',
  price: 100000,
  pages: 50,
  author: '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
};

var authorPayload: Author.AsObject = {
  id: '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
  name: 'Mauricio André',
  description: 'Mauricio descrição',
};

const initialData = {
  books: [
    [
      'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8',
      bookPayload,
    ],
  ],
  authors: [
    [
      '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
      authorPayload,
    ],
  ],
};

const globalDb = new DB(null, initialData);

const sandBox = sinon.createSandbox();

const request = <T, K>(instance, data) => {
  return { request: fromObject(instance, data) } as ServerUnaryCall<T, K>;
};

function fromObject<T, D>(instance: T, document?: D): T | undefined {
  if (!document) return;

  for (const property in instance) {
    if (!/^set(?!Extension).*/g.test(property)) continue;

    const propName = camelCase(property.replace('set', ''));
    const setter = instance[property] as unknown as (
      value: any,
    ) => typeof instance;
    setter.call(instance, document[propName]);
  }

  return instance;
}

describe('Deve listar todos os livros', assert => {
  const dbSpy = sandBox.spy(globalDb);
  const impl = booksImpl(dbSpy);
  impl.listBook(request({}, {}), (error, response) => {
    assert.true(dbSpy.listBooks.calledOnce);
    assert.true(response?.getBooksList().length === 1);
    assert.falsy(error);
  });

  sandBox.restore();
});

describe('Deve buscar um livro', assert => {
  const dbSpy = sandBox.spy(globalDb);
  const impl = booksImpl(dbSpy);
  impl.getBook(
    request(new GetBookRequest(), {
      bookid:
        'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8',
    }),
    (error, response) => {
      assert.true(dbSpy.getBook.calledOnce);
      assert.truthy(response?.getBooks());
      assert.is(
        response?.getBooks()?.getId(),
        'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8',
      );
      assert.falsy(error);
    },
  );

  sandBox.restore();
});

describe('Erro ao buscar um livro inexistente', assert => {
  const dbSpy = sandBox.spy(globalDb);
  const impl = booksImpl(dbSpy);
  const bookid = 'não existe';
  impl.getBook(request(new GetBookRequest(), { bookid }), (error, response) => {
    assert.true(dbSpy.getBook.calledOnce);
    assert.falsy(response);
    assert.truthy(error);
    assert.is(
      (error as ServerErrorResponse).message,
      `Book ${bookid} not found`,
    );
  });

  sandBox.restore();
});

describe('Erro ao deletar um livro inexistente', assert => {
  const spy = sandBox.spy(globalDb, 'deleteBook');
  sandBox.stub(globalDb, 'save').returns();
  sandBox.stub(globalDb, 'load').returns();

  const impl = booksImpl(globalDb);
  const bookid = 'não existe';
  impl.deleteBook(
    request(new DeleteBookRequest(), { bookid }),
    (error, response) => {
      assert.false(spy.calledOnce);
      assert.falsy(response);
      assert.truthy(error);
      assert.is(
        (error as ServerErrorResponse).message,
        `Book ${bookid} not found`,
      );
      assert.true(globalDb.data.books.size === 1);
    },
  );

  sandBox.restore();
});

describe('Deletar um livro existente', assert => {
  const localDb = new DB(null, initialData);
  const spy = sandBox.spy(localDb, 'deleteBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const bookid =
    'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8';
  impl.deleteBook(
    request(new DeleteBookRequest(), { bookid }),
    (error, response) => {
      assert.true(spy.calledOnce);
      assert.truthy(response);
      assert.falsy(error);
      assert.true(localDb.data.books.size === 0);
    },
  );

  sandBox.restore();
});

describe('Atualizar um livro existente', assert => {
  const localDb = new DB(null, initialData);
  const spy = sandBox.spy(localDb, 'updateBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const data = {
    bookid: 'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8',
    data: fromObject(new UpdateBookRequest.UpdateData(), { title: 'teste' }),
  };

  impl.updateBook(request(new UpdateBookRequest(), data), (error, response) => {
    assert.true(spy.calledOnce);
    assert.truthy(response);
    assert.falsy(error);
    assert.is(response?.getBooks()?.getTitle(), data.data?.getTitle());
    assert.is(response?.getBooks()?.getId(), data.bookid);
  });

  sandBox.restore();
});

describe('Erro ao atualizar um livro inexistente', assert => {
  const localDb = new DB(null, initialData);
  const spy = sandBox.spy(localDb, 'updateBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const data = {
    bookId: 'não existe',
    data: fromObject(new UpdateBookRequest.UpdateData(), { title: 'teste' }),
  };

  impl.updateBook(request(new UpdateBookRequest(), data), (error, response) => {
    assert.falsy(spy.calledOnce);
    assert.falsy(response);
    assert.truthy(error);
  });

  sandBox.restore();
});

describe('Não deve inserir um livro existente', assert => {
  const localDb = new DB(null, initialData);
  const spy = sandBox.spy(localDb, 'addBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const data = {
    book: fromObject(new UpdateBookRequest.UpdateData(), {
      author:
        '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
      title: 'Pensamentos sem sentido de um homem sem ideias',
    }),
  };

  impl.createBook(request(new CreateBookRequest(), data), (error, response) => {
    assert.true(spy.calledOnce);
    assert.falsy(response);
    assert.truthy(error);
    assert.regex((error as ServerErrorResponse).message, /already exists/);
  });

  sandBox.restore();
});

describe('Não deve incluir um livro de um autor inexistente', assert => {
  const localDb = new DB(null, initialData);
  const spy = sandBox.spy(localDb, 'addBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const data = {
    book: fromObject(new UpdateBookRequest.UpdateData(), {
      author: 'não existe',
      title: 'Pensamentos sem sentido de um homem sem ideias',
    }),
  };

  impl.createBook(request(new CreateBookRequest(), data), (error, response) => {
    assert.true(spy.calledOnce);
    assert.falsy(response);
    assert.truthy(error);
    assert.is(
      (error as ServerErrorResponse).message,
      `Author "${data.book?.getAuthor()}" not found`,
    );
  });

  sandBox.restore();
});

describe('Deve adicionar um novo livro', assert => {
  const localDb = new DB(null, initialData);
  const spy = sandBox.spy(localDb, 'addBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const data = {
    book: fromObject(new UpdateBookRequest.UpdateData(), {
      author:
        '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
      title: 'Pensamentos sem sentido de um homem sem ideias. Vol 2',
    }),
  };

  impl.createBook(request(new CreateBookRequest(), data), (error, response) => {
    assert.true(spy.calledOnce);
    assert.truthy(response);
    assert.falsy(error);
    assert.is(response?.getBooks()?.getTitle(), data.book?.getTitle());
    assert.true(localDb.data.books.size === 2);
  });

  sandBox.restore();
});
