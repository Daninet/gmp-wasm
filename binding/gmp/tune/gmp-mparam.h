/* Generated by tuneup.c, 2022-04-30, gcc 4.2 */

#define DIVREM_1_NORM_THRESHOLD              0  /* always */
#define DIVREM_1_UNNORM_THRESHOLD            0  /* always */
#define MOD_1_1P_METHOD                      2  /* 14.77% faster than 1 */
#define MOD_1_NORM_THRESHOLD                 0  /* always */
#define MOD_1_UNNORM_THRESHOLD               0  /* always */
#define MOD_1N_TO_MOD_1_1_THRESHOLD          8
#define MOD_1U_TO_MOD_1_1_THRESHOLD          4
#define MOD_1_1_TO_MOD_1_2_THRESHOLD        22
#define MOD_1_2_TO_MOD_1_4_THRESHOLD         0  /* never mpn_mod_1s_2p */
#define PREINV_MOD_1_TO_MOD_1_THRESHOLD     29
#define USE_PREINV_DIVREM_1                  1
#define DIV_QR_1N_PI1_METHOD                 1  /* 33.79% faster than 2 */
#define DIV_QR_1_NORM_THRESHOLD              3
#define DIV_QR_1_UNNORM_THRESHOLD            1
#define DIV_QR_2_PI2_THRESHOLD              13
#define DIVEXACT_1_THRESHOLD                 0  /* always */
#define BMOD_1_TO_MOD_1_THRESHOLD        MP_SIZE_T_MAX  /* never */

#define DIV_1_VS_MUL_1_PERCENT             116

#define MUL_TOOM22_THRESHOLD                12
#define MUL_TOOM33_THRESHOLD                77
#define MUL_TOOM44_THRESHOLD               118
#define MUL_TOOM6H_THRESHOLD               156
#define MUL_TOOM8H_THRESHOLD               212

#define MUL_TOOM32_TO_TOOM43_THRESHOLD      73
#define MUL_TOOM32_TO_TOOM53_THRESHOLD      91
#define MUL_TOOM42_TO_TOOM53_THRESHOLD      73
#define MUL_TOOM42_TO_TOOM63_THRESHOLD      78
#define MUL_TOOM43_TO_TOOM54_THRESHOLD      88

#define SQR_BASECASE_THRESHOLD               4
#define SQR_TOOM2_THRESHOLD                 26
#define SQR_TOOM3_THRESHOLD                 85
#define SQR_TOOM4_THRESHOLD                142
#define SQR_TOOM6_THRESHOLD                180
#define SQR_TOOM8_THRESHOLD                260

#define MULMID_TOOM42_THRESHOLD             18

#define MULMOD_BNM1_THRESHOLD                9
#define SQRMOD_BNM1_THRESHOLD               11

#define MUL_FFT_MODF_THRESHOLD             244  /* k = 5 */
#define MUL_FFT_TABLE3                                      \
  { {    244, 5}, {     11, 6}, {      6, 5}, {     13, 6}, \
    {      7, 5}, {     15, 6}, {     15, 7}, {      8, 6}, \
    {     17, 7}, {      9, 6}, {     19, 7}, {     13, 8}, \
    {      7, 7}, {     17, 8}, {      9, 7}, {     20, 8}, \
    {     11, 7}, {     23, 8}, {     13, 9}, {      7, 8}, \
    {     19, 9}, {     11, 8}, {     25,10}, {      7, 9}, \
    {     15, 8}, {     33, 9}, {     19, 8}, {     39, 9}, \
    {     23,10}, {     15, 9}, {     39,10}, {     23,11}, \
    {     15,10}, {     31, 9}, {     67,10}, {     39, 9}, \
    {     79,10}, {     47,11}, {   2048,12}, {   4096,13}, \
    {   8192,14}, {  16384,15}, {  32768,16} }
#define MUL_FFT_TABLE3_SIZE 43
#define MUL_FFT_THRESHOLD                 2240

#define SQR_FFT_MODF_THRESHOLD             208  /* k = 5 */
#define SQR_FFT_TABLE3                                      \
  { {    208, 5}, {     11, 6}, {      6, 5}, {     13, 6}, \
    {     15, 7}, {      8, 6}, {     17, 7}, {     13, 8}, \
    {      7, 7}, {     17, 8}, {      9, 7}, {     20, 8}, \
    {     13, 9}, {      7, 8}, {     19, 9}, {     11, 8}, \
    {     25,10}, {      7, 9}, {     15, 8}, {     33, 9}, \
    {     19, 8}, {     39, 9}, {     27,10}, {     15, 9}, \
    {     39,10}, {     23,11}, {     15,10}, {     31, 9}, \
    {     63,10}, {     39, 8}, {    159, 7}, {    319, 9}, \
    {     83,10}, {     47,11}, {   2048,12}, {   4096,13}, \
    {   8192,14}, {  16384,15}, {  32768,16} }
#define SQR_FFT_TABLE3_SIZE 39
#define SQR_FFT_THRESHOLD                 1984

#define MULLO_BASECASE_THRESHOLD             0  /* always */
#define MULLO_DC_THRESHOLD                  43
#define MULLO_MUL_N_THRESHOLD             4392
#define SQRLO_BASECASE_THRESHOLD             0  /* always */
#define SQRLO_DC_THRESHOLD                  90
#define SQRLO_SQR_THRESHOLD                590

#define DC_DIV_QR_THRESHOLD                 35
#define DC_DIVAPPR_Q_THRESHOLD             151
#define DC_BDIV_QR_THRESHOLD                40
#define DC_BDIV_Q_THRESHOLD                 86

#define INV_MULMOD_BNM1_THRESHOLD           22
#define INV_NEWTON_THRESHOLD               228
#define INV_APPR_THRESHOLD                 165

#define BINV_NEWTON_THRESHOLD              236
#define REDC_1_TO_REDC_N_THRESHOLD          46

#define MU_DIV_QR_THRESHOLD                979
#define MU_DIVAPPR_Q_THRESHOLD            1078
#define MUPI_DIV_QR_THRESHOLD               98
#define MU_BDIV_QR_THRESHOLD               807
#define MU_BDIV_Q_THRESHOLD                979

#define POWM_SEC_TABLE  7,34,135,579,1378

#define GET_STR_DC_THRESHOLD                19
#define GET_STR_PRECOMPUTE_THRESHOLD        27
#define SET_STR_DC_THRESHOLD               228
#define SET_STR_PRECOMPUTE_THRESHOLD      1356

#define FAC_DSC_THRESHOLD                  270
#define FAC_ODD_THRESHOLD                    0  /* always */

#define MATRIX22_STRASSEN_THRESHOLD         15
#define HGCD2_DIV1_METHOD                    3  /* 5.64% faster than 1 */
#define HGCD_THRESHOLD                      84
#define HGCD_APPR_THRESHOLD                101
#define HGCD_REDUCE_THRESHOLD             1437
#define GCD_DC_THRESHOLD                   327
#define GCDEXT_DC_THRESHOLD                253
#define JACOBI_BASE_METHOD                   4  /* 2.47% faster than 3 */

/* Tuneup completed successfully, took 74 seconds */