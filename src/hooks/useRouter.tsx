import {useEffect, useState} from 'react';
import base from '../lib/base';

interface History {
  page: string;
  qsp: URLSearchParams;
}

export interface RouterHook {
  page: string;
  qsp: URLSearchParams;
  routes: string[];
  redirect: (path: string) => void;
  hasBack: () => boolean;
  back: () => void;
  is: (path: string | null, mode?:'exact' | 'starts with') => boolean;
}

export const routerDefaultValues:RouterHook = {
  page: '',
  qsp: new URLSearchParams (''),
  routes: [],
  redirect: () => {},
  hasBack: () => false,
  back: () => {},
  is: () => false
}

export default function useRouter ():RouterHook {
  // all the possible routes
  const [routes, setRoutes] = useState<string[]> ([]);
  // get the current page
  let initialPage = window.location.href.split (window.location.origin) [1];
  // query string parameters
  const [qsp, setQsp] = useState<URLSearchParams> (new URLSearchParams (window.location.search));
  // hold the page and router history
  const [page, setPage] = useState<string> (initialPage);
  const [history, setHistory] = useState<History[]> ([]);
  // redirect in the app
  const redirect = (path:string) => {
    window.history.pushState ({}, 'LB Coffee Roasters', `${base}${path}`)
    let search = path.includes ('?') ? path.split ('?') [1] : '';
    setHistory ([...history, {page, qsp}])
    setQsp (new URLSearchParams (search));
    setPage (path);
  }
  // back button functions
  const hasBack = () => history.length > 0;
  const back = () => {
    if (!history.length) return;
    const arr = [...history];
    let next:History = arr.splice (arr.length - 1, 1) [0];
    setPage (next.page);
    setQsp (next.qsp);
    setHistory (arr);
    let params = Array.from (next.qsp.entries ()).map (([k, v]) => `${k}=${v}`).join ('&');
    window.history.pushState ({}, 'LB Coffee Roasters', `${base}?page=${next.page}${params}`)
  }
  // is on page
  const is = (path:string | null, mode:'exact' | 'starts with'='exact') => {
    if (path === null) return !routes.includes (page.split ('?') [0]);
    if (!routes.includes (path.split ('?') [0])) setRoutes ([...routes, path.split ('?') [0]]);
    if (mode === 'exact') return path === page;
    if (mode === 'starts with') return page.startsWith (path);
    return false;
  }
  // event when the url changes
  useEffect (() => {
    window.addEventListener ('popstate', () => {
      setPage (window.location.pathname);
      setQsp (new URLSearchParams (window.location.search))
    })
  }, [])

  return {page, qsp, routes, redirect, hasBack, back, is};

}