import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
  cloud: {
    cloudName: "dihfgqly4",
  },
  url: {
    secure: true,
  },
});

export function buildImg(src) {
  return cld.image(src).quality("auto").format("auto");
}
