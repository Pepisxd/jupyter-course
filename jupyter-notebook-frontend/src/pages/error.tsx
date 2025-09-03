import React from "react";
import { NextPageContext } from "next";

interface ErrorProps {
  statusCode?: number;
}

const ErrorPage: React.FC<ErrorProps> & {
  getInitialProps: (ctx: NextPageContext) => Promise<ErrorProps>;
} = ({ statusCode }) => {
  return (
    <div>
      <h1>{statusCode ? `Error ${statusCode}` : "Error en el cliente"}</h1>
      <p>
        {statusCode === 404
          ? "La página que buscas no existe."
          : "Ocurrió un error inesperado."}
      </p>
    </div>
  );
};

ErrorPage.getInitialProps = async ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
