import React, { useCallback, useEffect, useReducer, useState } from "react";
import "./App.scss";
import axios from "axios";

const FETCH_PHOTOS = "FETCH_PHOTOS" as const;
const SCROLL = "SCROLL" as const;

export interface IPhoto {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export type TState = {
  photos: IPhoto[];
  currentPage: number;
  fetching: boolean;
  totalCount: number;
};

export type TFetchPayload = {
  photos: IPhoto[];
  totalCount: number;
  fetching: boolean;
};

export type TFetchPhotos = {
  type: "FETCH_PHOTOS";
  payload: TFetchPayload;
};

export type TScroll = {
  type: "SCROLL";
  payload: boolean;
};

export const initialState: TState = {
  photos: [],
  currentPage: 1,
  totalCount: 0,
  fetching: true,
};

export type TAction = TFetchPhotos | TScroll;

export const reducer = (state: TState, action: TAction) => {
  const { type } = action;
  switch (type) {
    case FETCH_PHOTOS:
      return {
        ...state,
        photos: [...state.photos, ...action.payload.photos],
        currentPage: (state.currentPage += 1),
        totalCount: action.payload.totalCount,
        fetching: action.payload.fetching,
      };
    case SCROLL:
      return { ...state, fetching: action.payload };
    default:
      return state;
  }
};

const PHOTOS_URL = "https://jsonplaceholder.typicode.com/photos";
const LIMIT = 10;

const fetchPhotos = async (limit: number, page: number) => {
  try {
    const res = await axios.get<IPhoto[]>(
      `${PHOTOS_URL}?_limit=${limit}&_page=${page}`
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};

function App() {
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetching, setFetching] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // const [{ photos, totalCount, fetching, currentPage }, dispatch] = useReducer(
  //   reducer,
  //   initialState
  // );

  const handleScroll = useCallback(
    (event: any) => {
      const height = event.target.documentElement.scrollHeight; //общая высота с учетом скрола
      const top = event.target.documentElement.scrollTop; //высота скрола
      const innerHeight = window.innerHeight; //высота окна браузера
      //условие приближения скрола к нижней границе окна
      if (height - (top + innerHeight) < 200 && photos.length < totalCount) {
        setFetching(true);
        // dispatch({ type: SCROLL, payload: true });
      }
    },
    [totalCount, photos]
  );

  useEffect(() => {
    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    const fetch = async () => {
      const response = await fetchPhotos(LIMIT, currentPage);
      if (response) {
        setPhotos([...photos, ...response.data]);
        setCurrentPage((prev) => prev + 1);
        setTotalCount(Number(response.headers["x-total-count"]));
        setFetching(false);

        // dispatch({
        //   type: FETCH_PHOTOS,
        //   payload: {
        //     photos: response.data,
        //     totalCount: Number(response.headers["x-total-count"]),
        //     fetching: false,
        //   },
        // });
      }
    };

    if (fetching) {
      fetch();
    }
  }, [fetching]);

  return (
    <div className="mx-auto px-4" style={{ marginLeft: "3rem" }}>
      {photos.map(({ id, title, thumbnailUrl }) => (
        <div className="flex flex-col items-center gap-x-1" key={id}>
          <p className="font-bold text-gray-900 text-3xl">{title}</p>
          <img src={thumbnailUrl} alt="Something" />
        </div>
      ))}
    </div>
  );
}

export default App;
