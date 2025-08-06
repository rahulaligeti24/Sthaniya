import { useParams } from "react-router-dom";
 



function toPascalCase(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

export const  StateGallery2=()=> {
  const { state } = useParams();
  if (!state) {
    return <p className="text-red-500 mt-10 text-center">No state provided in URL</p>;
  }

  const stateKey = toPascalCase(state);
  const cityData = DataItems[stateKey];

  if (!cityData) {
    return <p className="text-center mt-10 text-red-500">No data found for "{stateKey}"</p>;
  }
  return(
    <>

    </>
  )
}