/* Copyright (c) 2023 IT Resources S.r.l.
 * Code licensed under the MIT license.
 * See license in LICENSE file here in the project or at
 * https://github.com/itross/fp-objection/blob/main/LICENSE
 */

'use strict'
const { test } = require('tap')
const build = require('./build.js')
const objectionPlugin = require('..')
const { Model } = require('objection')

test('Should reject for missing configuration', async (t) => {
  t.plan(2)
  const app = await build(t)
  t.rejects(app.register(objectionPlugin),
    Error('missing "config" param. Please, specify the config param as a Knex configuration object.'))
  t.notOk(app.objection)
})

test('Should register plugin even with no models', async (t) => {
  t.plan(1)
  const app = await build(t)
  await app.register(objectionPlugin, {
    config: {
      client: 'better-sqlite3',
      useNullAsDefault: true
    },
    models: []
  })
  t.ok(app.objection)
})

test('Should reject for wrong type of models option', async (t) => {
  t.plan(2)
  const app = await build(t)
  t.rejects(
    app.register(objectionPlugin, {
      config: {
        client: 'better-sqlite3',
        useNullAsDefault: true
      },
      models: 'test'
    }),
    Error('bad type for models: received "string", but expecting array of model classes.'))
  t.notOk(app.objection)
})

test('Should reject for the same namespace regitered twice', async (t) => {
  t.plan(1)
  const app = await build(t)

  await app.register(objectionPlugin, {
    config: {
      client: 'better-sqlite3',
      useNullAsDefault: true
    },
    models: []
  })

  t.rejects(
    app.register(objectionPlugin, {
      config: {
        client: 'better-sqlite3',
        useNullAsDefault: true
      },
      models: []
    }),
    Error('Objection Plugin namespace "objection" already registered.')
  )
})

test('Should register objection plugin with the User model', async (t) => {
  class User extends Model {
    static get tableName () {
      return 'user'
    }

    static get jsonSchema () {
      return {
        properties: {
          id: { type: 'string' },
          username: { type: 'string', minLength: 6, maxLength: 125 },
          email: { type: 'string', minLength: 3, maxLength: 255 }
        }
      }
    }
  }

  t.plan(3)
  const app = await build(t)

  await app.register(objectionPlugin, {
    config: {
      client: 'better-sqlite3',
      useNullAsDefault: true
    },
    models: [User]
  })

  t.ok(app.objection)
  t.ok(app.objection.UserModel)
  t.notOk(app.objection.User)
})
