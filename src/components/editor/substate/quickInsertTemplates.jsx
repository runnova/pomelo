import {
  HiOutlinePhoto,
  HiOutlineH1,
  HiOutlineH2,
  HiOutlineH3,
  HiOutlineMusicalNote,
  HiOutlinePlay
} from "solid-icons/hi";

import sampleMedia from "../../../assets/sample.png"
import sampleVideo from "../../../assets/video_sample.webm"

const SubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
    <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Zm120-80h240q17 0 28.5-11.5T560-360q0-17-11.5-28.5T520-400H280q-17 0-28.5 11.5T240-360q0 17 11.5 28.5T280-320Zm160-160h240q17 0 28.5-11.5T720-520q0-17-11.5-28.5T680-560H440q-17 0-28.5 11.5T400-520q0 17 11.5 28.5T440-480Zm-131.5-11.5Q320-503 320-520t-11.5-28.5Q297-560 280-560t-28.5 11.5Q240-537 240-520t11.5 28.5Q263-480 280-480t28.5-11.5Zm400 160Q720-343 720-360t-11.5-28.5Q697-400 680-400t-28.5 11.5Q640-377 640-360t11.5 28.5Q663-320 680-320t28.5-11.5Z" />
  </svg>
);

const PIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
    <path d="M160-240q-17 0-28.5-11.5T120-280q0-17 11.5-28.5T160-320h400q17 0 28.5 11.5T600-280q0 17-11.5 28.5T560-240H160Zm0-200q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520h640q17 0 28.5 11.5T840-480q0 17-11.5 28.5T800-440H160Zm0-200q-17 0-28.5-11.5T120-680q0-17 11.5-28.5T160-720h640q17 0 28.5 11.5T840-680q0 17-11.5 28.5T800-640H160Z" />
  </svg>
);


export const quickInsertTemplates = {
  H1: {
    label: "Heading 1",
    icon: HiOutlineH1,
    type: "text",
    content: "Heading 1",
    heading: "H1",
    style: {
      "font-size": "48px",
      "font-weight": 700,
      "line-height": "1.1"
    }
  },

  H2: {
    label: "Heading 2",
    icon: HiOutlineH2,
    type: "text",
    content: "Heading 2",
    heading: "H2",
    style: {
      "font-size": "36px",
      "font-weight": 700,
      "line-height": "1.2"
    }
  },

  H3: {
    label: "Heading 3",
    icon: HiOutlineH3,
    type: "text",
    content: "Heading 3",
    heading: "H3",
    style: {
      "font-size": "28px",
      "font-weight": 600,
      "line-height": "1.3"
    }
  },

  Sub: {
    label: "Subtitle",
    icon: SubIcon,
    type: "text",
    content: "Subtitle",
    style: {
      "font-size": "20px",
      "line-height": "1.4"
    }
  },

  P: {
    label: "Paragraph",
    icon: PIcon,
    type: "text",
    content: "Paragraph text",
    style: {}
  },

  MediaBox: {
    label: "Image",
    icon: HiOutlinePhoto,
    type: "media",
    content: "Media",
    mediaType: "image",
    src: sampleMedia,
    style: {
      "height": "100%"
    }
  },
  VideoBox: {
    label: "Video",
    icon: HiOutlinePlay,
    type: "media",
    content: "Media",
    mediaType: "video",
    src: sampleVideo,
    style: {
      "height": "100%"
    }
  },
  AudioBox: {
    label: "Audio",
    icon: HiOutlineMusicalNote,
    type: "media",
    content: "Media",
    mediaType: "audio",
    src: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Test_ogg_mp3_48kbps.wav?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
    style: {
      "height": "100%"
    }
  },
}
