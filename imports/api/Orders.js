import { Mongo } from "meteor/mongo";

// Colección privada de órdenes de pago; solo el servidor importa este módulo.
export const Orders = new Mongo.Collection("orders");
