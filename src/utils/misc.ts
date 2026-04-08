import { KeyboardEvent } from "react";

export interface IPrevRoom {
  name: string;
  id: string;
  lastVisited?: string;
}

function handleKeyPress<T = Element>(f: () => void, key: string){
  return (e: KeyboardEvent<T>) => {
      if(e.key === key){
          f()
      }
  }
}
export function handleEnterKeyPress<T = Element>(f: () => void){
  return handleKeyPress<T>(f, "Enter")
}
