import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="sm:w-56 inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="sm:w-56 lg:w:60 inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                              <div className='sm:w-80'>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    
                            <img src="./img/Main Logo.png" alt="Image1" className=" " />
                          
                  
                </div>
                <div className="flex justify-center"><span style={{color: '#000070' , fontFamily: "'Archivo Black', sans-serif", fontSize: '1.5rem' }}>Welcome To </span></div>
                <div className="flex justify-center "> <span style={{color: '#000070' , fontFamily: "'Archivo Black', sans-serif", fontSize: '1.5rem' }}>ELECTRONIK<span style={{color: '#E1862D' , fontFamily: "'Archivo Black', sans-serif", fontSize: '1.5rem' }}>HUB</span></span></div>
            </div>
            </div>
               
              
        </>
    );
}
