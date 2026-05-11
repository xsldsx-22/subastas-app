import React,
{
  useEffect,
  useState
}
from "react";

import { Meteor }
from "meteor/meteor";

import {
  useTracker
}
from "meteor/react-meteor-data";

import {
  Auctions
}
from "../../api/auctions";

import {
  AuctionCard
}
from "../components/AuctionCard";

export const Catalog = () => {

  // STATES
  const [search,
    setSearch
  ] =
    useState("");

  const [category,
    setCategory
  ] =
    useState("");

  const [sort,
    setSort
  ] =
    useState("");

  // SUB
  useEffect(() => {

    Meteor.subscribe(
      "allAuctions"
    );

  }, []);

  // SUBASTAS
  const auctions =
    useTracker(() => {

      let selector = {};

      // BUSCAR
      if (search) {

        selector.title = {

          $regex:
            search,

          $options:
            "i"

        };

      }

      // CATEGORÍA
      if (category) {

        selector.category =
          category;

      }

      // ORDEN
      let sortOption = {};

      // MENOR PRECIO
      if (
        sort === "low"
      ) {

        sortOption = {
          price: 1
        };

      }

      // MAYOR PRECIO
      if (
        sort === "high"
      ) {

        sortOption = {
          price: -1
        };

      }

      // RECIENTES
      if (
        sort === "recent"
      ) {

        sortOption = {
          createdAt: -1
        };

      }

      return Auctions.find(

        selector,

        {
          sort:
            sortOption
        }

      ).fetch();

    });

  return (

    <section
      className="catalog-page"
    >

      <h1>
        Catálogo
      </h1>

      {/* FILTROS */}

      <div
        className="filters"
      >

        {/* BUSCADOR */}

        <input

          type="text"

          placeholder="Buscar..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

        />

        {/* CATEGORÍA */}

        <select

          value={category}

          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }

        >

          <option value="Tecnología">
  Tecnología
</option>

<option value="Gaming">
  Gaming
</option>

<option value="Ropa">
  Ropa
</option>

<option value="Hogar">
  Hogar
</option>

<option value="Coleccionables">
  Coleccionables
</option>
        </select>

        {/* ORDEN */}

        <select

          value={sort}

          onChange={(e) =>
            setSort(
              e.target.value
            )
          }

        >

          <option value="">
            Ordenar
          </option>

          <option value="low">
            Menor precio
          </option>

          <option value="high">
            Mayor precio
          </option>

          <option value="recent">
            Más recientes
          </option>

        </select>

      </div>

      {/* GRID */}

      <div
        className="grid-productos"
      >

        {auctions.map(
          (auction) => (

            <AuctionCard

              key={
                auction._id
              }

              _id={
                auction._id
              }

              image={
                auction.image
              }

              title={
                auction.title
              }

              price={
                auction.price
              }

              hours={
                auction.hours
              }

              endsAt={
                auction.endsAt
              }

              lastBidBy={
                auction.lastBidBy
              }

            />

          )
        )}

      </div>

    </section>

  );

};