"use strict";

const { sanitizeEntity, parseMultipartData } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // creating News for singned user

  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.sports.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.sports.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.sports });
  },

  // Updating News

  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [sports] = await strapi.services.sports.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!sports) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.sports.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.sports.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.sports });
  },

  // Delete user News

  async delete(ctx) {
    const { id } = ctx.params;

    const [sports] = await strapi.services.sports.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!sports) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const entity = await strapi.services.sports.delete({ id });

    return sanitizeEntity(entity, { model: strapi.models.sports });
  },

  //api
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No Authorization found in header" }] },
      ]);
    }
    const data = await strapi.services.sports.find({ user: user.id });

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.sports });
  },
};
