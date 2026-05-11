import React, { useState } from "react";
import { Meteor } from "meteor/meteor";

export const CreateAuction = () => {

  const [title, setTitle] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [hours, setHours] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [condition, setCondition] =
    useState("");

  const [image, setImage] =
    useState("");
  
  const handleImage = (e) => {
    const file =
      e.target.files[0];

    if (!file) return;

    const imageURL =
      URL.createObjectURL(file);

    setImage(imageURL);

  };

  
  const handleSubmit = () => {

    Meteor.call(

      "createAuction",

      {
        title,
        price: Number(price),
        image,
        hours: Number(hours),
        description,
        category,
        condition

      },

      (error) => {

        if (error) {

          alert(error.reason);

        } else {

          alert(
            "Subasta creada"
          );

          setTitle("");
          setPrice("");
          setHours("");
          setImage("");

        }

      }

    );

  };

  return (

    <section className="auth-container">

      <div className="auth-box">

        <h2>
          Crear Subasta
        </h2>

        {/* TÍTULO */}

        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        {/* PRECIO */}

        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
        />

        {/* HORAS */}

        <input
          type="number"
          placeholder="Horas"
          value={hours}
          onChange={(e) =>
            setHours(e.target.value)
          }
        />
<select

  value={category}

  onChange={(e) =>

    setCategory(
      e.target.value
    )

  }

>

  <option value="">
    Selecciona categoría
  </option>

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

<input

  type="text"
  placeholder="Estado"
  value={condition}
  onChange={(e) =>
    setCondition(e.target.value)
  }
/>

<textarea
  placeholder="Descripción"
  value={description}
  onChange={(e) =>
    setDescription(e.target.value)
  }
/>
        {/* IMAGEN */}

        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
        />

        {/* PREVIEW */}

        {image && (

          <img

            src={image}

            style={{
              width: "100%",
              borderRadius: "10px",
              marginTop: "15px"
            }}

          />

        )}

        {/* BOTÓN */}

        <button
          onClick={handleSubmit}
        >
          Publicar
        </button>

      </div>

    </section>

  );

};