const Wrapper = ({
    children,
}: Readonly<{
    children?: React.ReactNode;
}>) => {
    return (
        <div className="w-full flex justify-center p-6 md:p-8">
            <div className="text-primary max-w-7xl w-full">
                {children}
            </div>
        </div>
    );
}

export default Wrapper