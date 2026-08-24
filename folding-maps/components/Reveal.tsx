'use client';
import { useEffect, useRef } from 'react';
export function Reveal({children,className=''}:{children:React.ReactNode,className?:string}){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{const n=ref.current;if(!n)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){n.classList.add('seen');o.disconnect()}},{threshold:.15});o.observe(n);return()=>o.disconnect()},[]);return <div ref={ref} className={`reveal ${className}`}>{children}</div>}
export function Marquee(){return <div className="marquee" aria-label="Industries we serve"><div>{['Real estate','Industrials','Logistics','Professional services','Construction','Trades','Real estate','Industrials','Logistics'].map((x,i)=><span key={i}>{x} <i>✦</i></span>)}</div></div>}
