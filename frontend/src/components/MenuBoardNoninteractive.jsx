import React from "react";
import bowl from "../imgs/oc.png";
import plate from "../imgs/plate.png";
import bigplate from "../imgs/bigplate.png";
import app from "../imgs/app.png";
import ala from "../imgs/ala.png";
import oc from "../imgs/oc.png";
import bb from "../imgs/bb.png";
import kpc from "../imgs/kpc.png";
import sfc from "../imgs/oc.png";
import brocb from "../imgs/brocb.png";
import gtc from "../imgs/gtc.png";
import bcb from "../imgs/bcb.png";
import mc from "../imgs/mc.png";
import bpc from "../imgs/oc.png";
import scb from "../imgs/scb.png";
import bc from "../imgs/oc.png";
import bps from "../imgs/bps.png";
import hws from "../imgs/hws.png";
import cm from "../imgs/cm.png";
import fr from "../imgs/fr.png";
import wr from "../imgs/wr.png";
import sg from "../imgs/sg.png";
import apr from "../imgs/apr.png";
import ccr from "../imgs/ccr.png";
import vsr from "../imgs/vsr.png";
import cer from "../imgs/cer.png";
import drinkssml from "../imgs/drinkssml.png";
import Navbar from "./Navbar";
import "../styles/MenuBoardNoninteractive.css";

/**
 * The MenuBoardNoninteractive component displays a categorized menu board.
 * Each category includes items with names, images, and descriptions.
 * @component
 */
const MenuBoardNoninteractive = () => {
  /**
   * Full list of menu items including their names, images, and descriptions.
   * @constant
   * @type {Array.<{name: string, image: string, description: string}>}
   */
  const itms = [
    { name: "Bowl", image: bowl, description: "This item comes with 1 Entree and 1 side" },
    { name: "Plate", image: plate, description: "This item comes with 2 Entree's and 1 side" },
    { name: "Bigger Plate", image: bigplate, description: "This item comes with 3 Entree's and 1 side" },
    { name: "Appetizer", image: app, description: "Traditional Appetizers, see below" },
    { name: "A la Carte", image: ala, description: "When you want just the entree or the side" },
    { name: "Orange Chicken", image: oc, description: "Classic Chicken in Famous Orange Sauce" },
    { name: "Bejing Beef", image: bb, description: "Our tender beef, marinated and stir fried" },
    { name: "Kung Pao Chicken", image: kpc, description: "Chicken with a mix of peanuts and other classic ingredients" },
    { name: "SweetFire Chicken Breast", image: sfc, description: "This dish uses pineapple to add sweetness, while also having a sneaky kick of heat" },
    { name: "Broccoli Beef", image: brocb, description: "Traditional Beef Stir Fried with Broccoli" },
    { name: "Grilled Teriyaki Chicken", image: gtc, description: "This is marinated chicken that is then grilled and covered in teriyaki sauce" },
    { name: "String Bean Chicken Breast", image: bcb, description: "Chicken stir fried with a mix of string beans and other items" },
    { name: "Mushroom Chicken", image: mc, description: "Our take on the classic mushroom chicken dish, with a mix of signature sauces and tanginess" },
    { name: "Black Pepper Chicken", image: bpc, description: "For those who like some heat" },
    { name: "Sesame Chicken Breast", image: scb, description: "Classic fried chicken tossed in sesame sauce" },
    { name: "Bourbon Chicken", image: bc, description: "This dish blends a mix of flavors and achieves a sweet yet savory taste" },
    { name: "Black Pepper Steak", image: bps, description: "Our marinated beef" },
    { name: "Honey Walnut Shrimp", image: hws, description: "A favorite, including fried shrimp, and a mix of walnuts" },
    { name: "Chow Mein", image: cm, description: "Classic noodles, that are stir fried with a blend of ingredients" },
    { name: "Fried Rice", image: fr, description: "House rice stir fried with a blend of spices" },
    { name: "White Rice", image: wr, description: "Classic White Rice" },
    { name: "Super Greens", image: sg, description: "Includes broccoli, kale and cabbage" },
    { name: "Apple Pie Roll", image: apr, description: "A treat for anyone with a sweet tooth" },
    { name: "Cream Cheese Rangoon", image: ccr, description: "Delicious cream cheese wrapped in wonton paper and fried" },
    { name: "Veggie Spring Roll", image: vsr, description: "A mix of veggies wrapped in wonton paper and fried" },
    { name: "Chicken Egg Roll", image: cer, description: "A mix of chicken and veggies wrapped in wonton paper and fried" },
    { name: "Drinks", image: drinkssml, description: "Drinks come in small, medium, and large" },
  ];

  /**
   * Categorized list of menu items, split by headers.
   * @constant
   * @type {Array.<{header: string, items: Array.<{name: string, image: string, description: string}>}>}
   */
  const cat = [
    { header: "Meal Sizes", items: itms.slice(0, 5) },
    { header: "Entrees", items: itms.slice(5, 18) },
    { header: "Sides", items: itms.slice(18, 22) },
    { header: "Appetizers", items: itms.slice(22, 26) },
    { header: "Drinks", items: itms.slice(26, 27) },
  ];

  return (
    <>
      <Navbar />
      <div className="ovrbr">
        {cat.map((ca, cats) => (
          <div key={cats}>
            <h1 className="ovrsc">{ca.header}</h1>
            <div className="ovritms">
              {ca.items.map((im, ht) => (
                <div key={ht} className="ovrc">
                  <img src={im.image} alt={im.name} className="allimgs" />
                  <h1 className="itmn">{im.name}</h1>
                  <p className="scrip">{im.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MenuBoardNoninteractive;
