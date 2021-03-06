/* This is a conversion from BLAS to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { FortranArrEComplex, mul_rxr } from '../../../f_func';

export function transUpper(
    kx: number,
    noconj: boolean,
    nounit: boolean,
    x: FortranArrEComplex,
    incx: number,
    ap: FortranArrEComplex,
    n: number
) {

    //Form  x := A**T*x  or  x := A**H*x.
    let kk = n * (n + 1) / 2;
    let jx = kx + (n - 1) * incx;
    for (let j = n; j >= 1; j--) {
        let tempRe = x.r[jx - x.base];
        let tempIm = x.i[jx - x.base];
        let ix = jx;
        if (nounit) {
            //(a+ib)*(c-id) = (ac+bd)+i(-ad+bc)
            const apk2 = kk - ap.base;
            const { re, im } = mul_rxr(
                tempRe,
                tempIm,
                ap.r[apk2],
                noconj ? ap.i[apk2] : -ap.i[apk2]
            );
            tempRe = re;
            tempIm = im;
        }
        for (let k = kk - 1; k >= kk - j + 1; k--) {
            ix -= incx;
            const apk = k - ap.base;
            //(a-ib)*(c+id) = (ac+bd)+i(ad-bc)
            const { re, im } = mul_rxr(
                ap.r[apk],
                noconj ? ap.i[apk] : -ap.i[apk],
                x.r[ix - x.base],
                x.i[ix - x.base]
            )
            tempRe += re;
            tempIm += im;
        }

        x.r[jx - x.base] = tempRe;
        x.i[jx - x.base] = tempIm;
        jx -= incx;
        kk -= j;
    }
}
