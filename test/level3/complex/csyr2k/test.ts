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

import { assert, expect } from 'chai';
import * as blas from '../../../../src/lib';
import { Matrix } from '../../../../src/lib/f_func';
import { matrix_mxn } from '../../../matrices';

import {
  approximately,
  approximatelyWithPrec
} from '../../../test-helpers';

import { fixture } from './fixtures';

const {
  util: {
    arrayrify,
    numberPrecision,
    each,
    multiplexer,
    fortranArrComplex64,
    fortranMatrixComplex64,
    complex,
    muxCmplx
  },
  level3: {
    csyr2k
  }
} = blas;

const { abs } = Math;
const { isNaN, isFinite } = Number;

describe('blas level 3 single/double complex', function n() {
  describe('csyr2k', () => {
    describe('data tests', () => {
      //  SUBROUTINE ZSYRK(UPLO,TRANS,N,K,ALPHA,A,LDA,BETA,C,LDC)
      //   C := alpha*A*B**T + alpha*B*A**T + beta*C,
      //
      const { csyr2k: testData } = fixture;
      each(testData)(({
        input: {
          cmd,
          uplo,
          trans,
          n,
          k,
          alpha,
          beta,
          lda,
          ldb,
          ldc,
          a,
          b,
          c
        }, expect, desc
      }, key) => {

        it(`[${key}]/[${desc}]`, function t() {
          //ZSYR2K(UPLO,TRANS,N,K,ALPHA,A,LDA,B,LDB,BETA,C,LDC)  
          csyr2k(uplo, trans, n, k, alpha, a, lda, b, ldb, beta, c, ldc);
          const approx = approximatelyWithPrec(1E-5);
          if (cmd === 'logDebug') {
            c.toArr().forEach(cc =>
              console.log(`     + (${cc.re},${cc.im}),`));
          }
          multiplexer(c.toArr(), expect.c)(approx);
        });
      });
    });

    describe('test errors', () => {
      const { csyr2kErrors: errors } = fixture;
      each(errors)(({ input: {
        uplo,
        trans,
        n, // A = m*m marrix , lda >= m
        k, // columns
        alpha,  // B = alpha * A * B
        beta,
        lda, //physical storage
        ldb, //physical storage
        ldc, //physical storage
        //
        a: ap,
        b: bp,
        c: cp
      }, desc }, key) => {
        it(`[${key}]/[${desc}]`, function t() {

          const a = fortranMatrixComplex64(ap)(1, 1);
          const b = fortranMatrixComplex64(bp)(1, 1);
          const c = fortranMatrixComplex64(cp)(1, 1);
          const call = () => csyr2k(uplo, trans, n, k, alpha, a, lda, b, ldb, beta, c, ldc);
          //call();
          expect(call).to.throw();
        });
      });
    });
  });
});
