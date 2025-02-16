import React from 'react';

export default function SiteLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      id="Layer_1"
      x="0px"
      y="0px"
      width="124px"
      height="80px"
      viewBox="0 0 124 80"
      enableBackground="new 0 0 124 80"
      xmlSpace="preserve"
      {...props}
    >
      <image
        id="image0"
        width="124"
        height="80"
        x="0"
        y="0"
        href="data:image/png;base64,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 MjY6NDgrMDA6MDB9ET2JAAAAAElFTkSuQmCC"
      />
    </svg>
  );
}
