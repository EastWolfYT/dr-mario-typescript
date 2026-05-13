import { Gra } from "./gra"

function dopasujSkaleGry() {
  const gameScreen = document.getElementById("gameScreen")

  if (gameScreen === null) {
    return;
  }

  const szerokoscOkna = window.innerWidth;
  const wysokoscOkna = window.innerHeight;

  const skalaX = szerokoscOkna / 640;
  const skalaY = wysokoscOkna / 385;
  const skala = Math.min(skalaX, skalaY);

  gameScreen.style.transform = `scale(${skala})`
  gameScreen.style.visibility = "visible"
}

window.addEventListener("resize", dopasujSkaleGry)
window.addEventListener("load", dopasujSkaleGry)

const gra = new Gra();
gra.rysujCalaGre();
dopasujSkaleGry();
