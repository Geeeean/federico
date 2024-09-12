const Wrapper = ({
    children,
}: Readonly<{
    children?: React.ReactNode;
}>) => {
    return (
        <div className="text-primary w-full flex flex-col items-center p-4 py-6">
            {children}
        </div>
    );
}

export default Wrapper