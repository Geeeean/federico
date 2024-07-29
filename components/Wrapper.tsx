const Wrapper = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="p-8 text-primary container">
            {children}
        </div>
    );
}

export default Wrapper