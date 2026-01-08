#include "circom.hpp"
#include "calcwit.hpp"
#define NSignals 772
#define NComponents 13
#define NOutputs 1
#define NInputs 103
#define NVars 489
#define NPublic 3
#define __P__ "21888242871839275222246405745257275088548364400416034343698204186575808495617"

/*
CreditCheck
*/
void CreditCheck_ad690d6bdf5dff0c(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _tmp_1[1];
    FrElement sum[1];
    FrElement _tmp_4[1];
    FrElement i[1];
    FrElement _sigValue_1[1];
    FrElement _tmp_5[1];
    FrElement _tmp_7[1];
    FrElement _tmp_6[1];
    FrElement _tmp_8[1];
    FrElement _sigValue_2[1];
    FrElement _sigValue_3[1];
    FrElement _sigValue_4[1];
    FrElement _sigValue_5[1];
    FrElement _sigValue_6[1];
    FrElement _sigValue_7[1];
    FrElement _sigValue_8[1];
    FrElement _sigValue_9[1];
    FrElement _sigValue_10[1];
    FrElement _sigValue_11[1];
    int _orderAmounts_sigIdx_;
    int _offset_5;
    int _offset_12;
    int _totalRevenue_sigIdx_;
    int _compIdx;
    int _in_sigIdx_;
    int _offset_19;
    int _compIdx_1;
    int _in_sigIdx__1;
    int _offset_20;
    int _revenueThreshold_sigIdx_;
    int _compIdx_2;
    int _out_sigIdx_;
    int _revenueCheck_sigIdx_;
    int _compIdx_3;
    int _in_sigIdx__2;
    int _offset_21;
    int _benfordScore_sigIdx_;
    int _compIdx_4;
    int _in_sigIdx__3;
    int _offset_22;
    int _benfordThreshold_sigIdx_;
    int _compIdx_5;
    int _out_sigIdx__1;
    int _benfordCheck_sigIdx_;
    int _compIdx_6;
    int _a_sigIdx_;
    int _compIdx_7;
    int _b_sigIdx_;
    int _compIdx_8;
    int _out_sigIdx__2;
    int _isValid_sigIdx_;
    Circom_Sizes _sigSizes_orderAmounts;
    Circom_Sizes _sigSizes_in;
    Circom_Sizes _sigSizes_in_1;
    Circom_Sizes _sigSizes_in_2;
    Circom_Sizes _sigSizes_in_3;
    PFrElement _loopCond;
    Fr_copy(&(_tmp_4[0]), ctx->circuit->constants +1);
    Fr_copy(&(i[0]), ctx->circuit->constants +1);
    _orderAmounts_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x40780f9231fa1600LL /* orderAmounts */);
    _totalRevenue_sigIdx_ = ctx->getSignalOffset(__cIdx, 0xdd83dab768f095d3LL /* totalRevenue */);
    _revenueThreshold_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x58392850dcb1bdf6LL /* revenueThreshold */);
    _revenueCheck_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x234fdeccc9dcb32dLL /* revenueCheck */);
    _benfordScore_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x38712fef8819821bLL /* benfordScore */);
    _benfordThreshold_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x6dfe792d8cce5c32LL /* benfordThreshold */);
    _benfordCheck_sigIdx_ = ctx->getSignalOffset(__cIdx, 0xceee2b01b1276369LL /* benfordCheck */);
    _isValid_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x645a3bc684679a41LL /* isValid */);
    _sigSizes_orderAmounts = ctx->getSignalSizes(__cIdx, 0x40780f9231fa1600LL /* orderAmounts */);
    /* signal private input orderAmounts[100] */
    /* signal private input benfordScore */
    /* signal input revenueThreshold */
    /* signal input benfordThreshold */
    /* signal output isValid */
    /* signal totalRevenue */
    /* signal revenueCheck */
    /* signal benfordCheck */
    /* var i */
    /* var sum */
    /* sum = 0 */
    /* for (i = 0;i < 100;i++) */
    /* sum = sum + orderAmounts[i] */
    _offset_5 = _orderAmounts_sigIdx_;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_5, _sigValue, 1);
    Fr_add(_tmp_1, (ctx->circuit->constants + 0), _sigValue);
    Fr_copyn(sum, _tmp_1, 1);
    _loopCond = _tmp_4;
    while (Fr_isTrue(_loopCond)) {
        /* sum = sum + orderAmounts[i] */
        _offset_12 = _orderAmounts_sigIdx_ + Fr_toInt(i)*_sigSizes_orderAmounts[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_12, _sigValue_1, 1);
        Fr_add(_tmp_5, sum, _sigValue_1);
        Fr_copyn(sum, _tmp_5, 1);
        Fr_copyn(_tmp_7, i, 1);
        Fr_add(_tmp_6, i, (ctx->circuit->constants + 1));
        Fr_copyn(i, _tmp_6, 1);
        Fr_lt(_tmp_8, i, (ctx->circuit->constants + 2));
        _loopCond = _tmp_8;
    }
    /* totalRevenue <-- sum */
    ctx->setSignal(__cIdx, __cIdx, _totalRevenue_sigIdx_, sum);
    /* totalRevenue === sum */
    ctx->multiGetSignal(__cIdx, __cIdx, _totalRevenue_sigIdx_, _sigValue_2, 1);
    ctx->checkConstraint(__cIdx, _sigValue_2, sum, "D:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit\zk-circuit\creditCheck.circom:45:4");
    /* component revenueGate = GreaterEqThan(64) */
    /* revenueGate.in[0] <== totalRevenue */
    _compIdx = ctx->getSubComponentOffset(__cIdx, 0xc9461ddc735e500cLL /* revenueGate */);
    _in_sigIdx_ = ctx->getSignalOffset(_compIdx, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_in = ctx->getSignalSizes(_compIdx, 0x08b73807b55c4bbeLL /* in */);
    _offset_19 = _in_sigIdx_;
    ctx->multiGetSignal(__cIdx, __cIdx, _totalRevenue_sigIdx_, _sigValue_3, 1);
    ctx->setSignal(__cIdx, _compIdx, _offset_19, _sigValue_3);
    /* revenueGate.in[1] <== revenueThreshold */
    _compIdx_1 = ctx->getSubComponentOffset(__cIdx, 0xc9461ddc735e500cLL /* revenueGate */);
    _in_sigIdx__1 = ctx->getSignalOffset(_compIdx_1, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_in_1 = ctx->getSignalSizes(_compIdx_1, 0x08b73807b55c4bbeLL /* in */);
    _offset_20 = _in_sigIdx__1 + 1*_sigSizes_in_1[1];
    ctx->multiGetSignal(__cIdx, __cIdx, _revenueThreshold_sigIdx_, _sigValue_4, 1);
    ctx->setSignal(__cIdx, _compIdx_1, _offset_20, _sigValue_4);
    /* revenueCheck <== revenueGate.out */
    _compIdx_2 = ctx->getSubComponentOffset(__cIdx, 0xc9461ddc735e500cLL /* revenueGate */);
    _out_sigIdx_ = ctx->getSignalOffset(_compIdx_2, 0x19f79b1921bbcfffLL /* out */);
    ctx->multiGetSignal(__cIdx, _compIdx_2, _out_sigIdx_, _sigValue_5, 1);
    ctx->setSignal(__cIdx, __cIdx, _revenueCheck_sigIdx_, _sigValue_5);
    /* component benfordGate = LessThan(64) */
    /* benfordGate.in[0] <== benfordScore */
    _compIdx_3 = ctx->getSubComponentOffset(__cIdx, 0x407ff245b72e9bc0LL /* benfordGate */);
    _in_sigIdx__2 = ctx->getSignalOffset(_compIdx_3, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_in_2 = ctx->getSignalSizes(_compIdx_3, 0x08b73807b55c4bbeLL /* in */);
    _offset_21 = _in_sigIdx__2;
    ctx->multiGetSignal(__cIdx, __cIdx, _benfordScore_sigIdx_, _sigValue_6, 1);
    ctx->setSignal(__cIdx, _compIdx_3, _offset_21, _sigValue_6);
    /* benfordGate.in[1] <== benfordThreshold */
    _compIdx_4 = ctx->getSubComponentOffset(__cIdx, 0x407ff245b72e9bc0LL /* benfordGate */);
    _in_sigIdx__3 = ctx->getSignalOffset(_compIdx_4, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_in_3 = ctx->getSignalSizes(_compIdx_4, 0x08b73807b55c4bbeLL /* in */);
    _offset_22 = _in_sigIdx__3 + 1*_sigSizes_in_3[1];
    ctx->multiGetSignal(__cIdx, __cIdx, _benfordThreshold_sigIdx_, _sigValue_7, 1);
    ctx->setSignal(__cIdx, _compIdx_4, _offset_22, _sigValue_7);
    /* benfordCheck <== benfordGate.out */
    _compIdx_5 = ctx->getSubComponentOffset(__cIdx, 0x407ff245b72e9bc0LL /* benfordGate */);
    _out_sigIdx__1 = ctx->getSignalOffset(_compIdx_5, 0x19f79b1921bbcfffLL /* out */);
    ctx->multiGetSignal(__cIdx, _compIdx_5, _out_sigIdx__1, _sigValue_8, 1);
    ctx->setSignal(__cIdx, __cIdx, _benfordCheck_sigIdx_, _sigValue_8);
    /* component andGate = AND() */
    /* andGate.a <== revenueCheck */
    _compIdx_6 = ctx->getSubComponentOffset(__cIdx, 0x9d780c1f9a47cab9LL /* andGate */);
    _a_sigIdx_ = ctx->getSignalOffset(_compIdx_6, 0xaf63dc4c8601ec8cLL /* a */);
    ctx->multiGetSignal(__cIdx, __cIdx, _revenueCheck_sigIdx_, _sigValue_9, 1);
    ctx->setSignal(__cIdx, _compIdx_6, _a_sigIdx_, _sigValue_9);
    /* andGate.b <== benfordCheck */
    _compIdx_7 = ctx->getSubComponentOffset(__cIdx, 0x9d780c1f9a47cab9LL /* andGate */);
    _b_sigIdx_ = ctx->getSignalOffset(_compIdx_7, 0xaf63df4c8601f1a5LL /* b */);
    ctx->multiGetSignal(__cIdx, __cIdx, _benfordCheck_sigIdx_, _sigValue_10, 1);
    ctx->setSignal(__cIdx, _compIdx_7, _b_sigIdx_, _sigValue_10);
    /* isValid <== andGate.out */
    _compIdx_8 = ctx->getSubComponentOffset(__cIdx, 0x9d780c1f9a47cab9LL /* andGate */);
    _out_sigIdx__2 = ctx->getSignalOffset(_compIdx_8, 0x19f79b1921bbcfffLL /* out */);
    ctx->multiGetSignal(__cIdx, _compIdx_8, _out_sigIdx__2, _sigValue_11, 1);
    ctx->setSignal(__cIdx, __cIdx, _isValid_sigIdx_, _sigValue_11);
    ctx->finished(__cIdx);
}
/*
GreaterEqThan
n=64
*/
void GreaterEqThan_839c44f336a05c65(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _sigValue_1[1];
    FrElement _sigValue_2[1];
    FrElement _tmp[1];
    int _compIdx;
    int _in_sigIdx_;
    int _offset;
    int _in_sigIdx__1;
    int _offset_1;
    int _compIdx_1;
    int _in_sigIdx__2;
    int _offset_2;
    int _offset_3;
    int _compIdx_2;
    int _out_sigIdx_;
    int _out_sigIdx__1;
    Circom_Sizes _sigSizes_in;
    Circom_Sizes _sigSizes_in_1;
    Circom_Sizes _sigSizes_in_2;
    _in_sigIdx__1 = ctx->getSignalOffset(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    _out_sigIdx__1 = ctx->getSignalOffset(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    _sigSizes_in_1 = ctx->getSignalSizes(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    /* signal input in[2] */
    /* signal output out */
    /* component lt = LessThan(n) */
    /* lt.in[0] <== in[0] */
    _compIdx = ctx->getSubComponentOffset(__cIdx, 0x08ad5407b55426cdLL /* lt */);
    _in_sigIdx_ = ctx->getSignalOffset(_compIdx, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_in = ctx->getSignalSizes(_compIdx, 0x08b73807b55c4bbeLL /* in */);
    _offset = _in_sigIdx_;
    _offset_1 = _in_sigIdx__1;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_1, _sigValue, 1);
    ctx->setSignal(__cIdx, _compIdx, _offset, _sigValue);
    /* lt.in[1] <== in[1] */
    _compIdx_1 = ctx->getSubComponentOffset(__cIdx, 0x08ad5407b55426cdLL /* lt */);
    _in_sigIdx__2 = ctx->getSignalOffset(_compIdx_1, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_in_2 = ctx->getSignalSizes(_compIdx_1, 0x08b73807b55c4bbeLL /* in */);
    _offset_2 = _in_sigIdx__2 + 1*_sigSizes_in_2[1];
    _offset_3 = _in_sigIdx__1 + 1*_sigSizes_in_1[1];
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_3, _sigValue_1, 1);
    ctx->setSignal(__cIdx, _compIdx_1, _offset_2, _sigValue_1);
    /* out <== 1 - lt.out */
    _compIdx_2 = ctx->getSubComponentOffset(__cIdx, 0x08ad5407b55426cdLL /* lt */);
    _out_sigIdx_ = ctx->getSignalOffset(_compIdx_2, 0x19f79b1921bbcfffLL /* out */);
    ctx->multiGetSignal(__cIdx, _compIdx_2, _out_sigIdx_, _sigValue_2, 1);
    Fr_sub(_tmp, (ctx->circuit->constants + 1), _sigValue_2);
    ctx->setSignal(__cIdx, __cIdx, _out_sigIdx__1, _tmp);
    ctx->finished(__cIdx);
}
/*
LessThan
n=64
*/
void LessThan_eba45112d4d3a1ec(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _sigValue_1[1];
    FrElement _sigValue_2[1];
    FrElement _sigValue_3[1];
    FrElement _tmp_3[1];
    FrElement i[1];
    FrElement _sigValue_4[1];
    FrElement _sigValue_5[1];
    FrElement _tmp_5[1];
    FrElement _tmp_4[1];
    FrElement _tmp_6[1];
    FrElement _sigValue_6[1];
    int _compIdx;
    int _in_sigIdx_;
    int _in_sigIdx__1;
    int _offset;
    int _compIdx_1;
    int _in_sigIdx__2;
    int _offset_1;
    int _compIdx_2;
    int _in_sigIdx__3;
    int _offset_6;
    int _compIdx_3;
    int _out_sigIdx_;
    int _offset_8;
    int _compIdx_4;
    int _in_sigIdx__4;
    int _offset_10;
    int _compIdx_5;
    int _out_sigIdx__1;
    int _offset_12;
    int _compIdx_6;
    int _in_sigIdx__5;
    int _offset_18;
    int _compIdx_7;
    int _out_sigIdx__2;
    int _offset_20;
    int _compIdx_8;
    int _in_sigIdx__6;
    int _offset_22;
    int _compIdx_9;
    int _out_sigIdx__3;
    int _offset_24;
    int _compIdx_10;
    int _out_sigIdx__4;
    int _offset_30;
    int _out_sigIdx__5;
    Circom_Sizes _sigSizes_in;
    Circom_Sizes _sigSizes_in_1;
    Circom_Sizes _sigSizes_out;
    Circom_Sizes _sigSizes_in_2;
    Circom_Sizes _sigSizes_out_1;
    Circom_Sizes _sigSizes_in_3;
    Circom_Sizes _sigSizes_out_2;
    Circom_Sizes _sigSizes_in_4;
    Circom_Sizes _sigSizes_out_3;
    Circom_Sizes _sigSizes_out_4;
    PFrElement _loopCond;
    Fr_copy(&(_tmp_3[0]), ctx->circuit->constants +1);
    Fr_copy(&(i[0]), ctx->circuit->constants +1);
    _in_sigIdx__1 = ctx->getSignalOffset(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    _out_sigIdx__5 = ctx->getSignalOffset(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    _sigSizes_in = ctx->getSignalSizes(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    /* signal input in[2] */
    /* signal output out */
    /* component num2Bits0 */
    /* component num2Bits1 */
    /* component adder */
    /* adder = BinSum(n, 2) */
    /* num2Bits0 = Num2Bits(n) */
    /* num2Bits1 = Num2BitsNeg(n) */
    /* in[0] ==> num2Bits0.in */
    _compIdx = ctx->getSubComponentOffset(__cIdx, 0x5c15316186c96585LL /* num2Bits0 */);
    _in_sigIdx_ = ctx->getSignalOffset(_compIdx, 0x08b73807b55c4bbeLL /* in */);
    _offset = _in_sigIdx__1;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset, _sigValue, 1);
    ctx->setSignal(__cIdx, _compIdx, _in_sigIdx_, _sigValue);
    /* in[1] ==> num2Bits1.in */
    _compIdx_1 = ctx->getSubComponentOffset(__cIdx, 0x5c15306186c963d2LL /* num2Bits1 */);
    _in_sigIdx__2 = ctx->getSignalOffset(_compIdx_1, 0x08b73807b55c4bbeLL /* in */);
    _offset_1 = _in_sigIdx__1 + 1*_sigSizes_in[1];
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_1, _sigValue_1, 1);
    ctx->setSignal(__cIdx, _compIdx_1, _in_sigIdx__2, _sigValue_1);
    /* var i */
    /* for (i=0;i<n;i++) */
    /* num2Bits0.out[i] ==> adder.in[0][i] */
    _compIdx_2 = ctx->getSubComponentOffset(__cIdx, 0x235decfdfd543243LL /* adder */);
    _in_sigIdx__3 = ctx->getSignalOffset(_compIdx_2, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_in_1 = ctx->getSignalSizes(_compIdx_2, 0x08b73807b55c4bbeLL /* in */);
    _offset_6 = _in_sigIdx__3;
    _compIdx_3 = ctx->getSubComponentOffset(__cIdx, 0x5c15316186c96585LL /* num2Bits0 */);
    _out_sigIdx_ = ctx->getSignalOffset(_compIdx_3, 0x19f79b1921bbcfffLL /* out */);
    _sigSizes_out = ctx->getSignalSizes(_compIdx_3, 0x19f79b1921bbcfffLL /* out */);
    _offset_8 = _out_sigIdx_;
    ctx->multiGetSignal(__cIdx, _compIdx_3, _offset_8, _sigValue_2, 1);
    ctx->setSignal(__cIdx, _compIdx_2, _offset_6, _sigValue_2);
    /* num2Bits1.out[i] ==> adder.in[1][i] */
    _compIdx_4 = ctx->getSubComponentOffset(__cIdx, 0x235decfdfd543243LL /* adder */);
    _in_sigIdx__4 = ctx->getSignalOffset(_compIdx_4, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_in_2 = ctx->getSignalSizes(_compIdx_4, 0x08b73807b55c4bbeLL /* in */);
    _offset_10 = _in_sigIdx__4 + 1*_sigSizes_in_2[1];
    _compIdx_5 = ctx->getSubComponentOffset(__cIdx, 0x5c15306186c963d2LL /* num2Bits1 */);
    _out_sigIdx__1 = ctx->getSignalOffset(_compIdx_5, 0x19f79b1921bbcfffLL /* out */);
    _sigSizes_out_1 = ctx->getSignalSizes(_compIdx_5, 0x19f79b1921bbcfffLL /* out */);
    _offset_12 = _out_sigIdx__1;
    ctx->multiGetSignal(__cIdx, _compIdx_5, _offset_12, _sigValue_3, 1);
    ctx->setSignal(__cIdx, _compIdx_4, _offset_10, _sigValue_3);
    _loopCond = _tmp_3;
    while (Fr_isTrue(_loopCond)) {
        /* num2Bits0.out[i] ==> adder.in[0][i] */
        _compIdx_6 = ctx->getSubComponentOffset(__cIdx, 0x235decfdfd543243LL /* adder */);
        _in_sigIdx__5 = ctx->getSignalOffset(_compIdx_6, 0x08b73807b55c4bbeLL /* in */);
        _sigSizes_in_3 = ctx->getSignalSizes(_compIdx_6, 0x08b73807b55c4bbeLL /* in */);
        _offset_18 = _in_sigIdx__5 + Fr_toInt(i)*_sigSizes_in_3[2];
        _compIdx_7 = ctx->getSubComponentOffset(__cIdx, 0x5c15316186c96585LL /* num2Bits0 */);
        _out_sigIdx__2 = ctx->getSignalOffset(_compIdx_7, 0x19f79b1921bbcfffLL /* out */);
        _sigSizes_out_2 = ctx->getSignalSizes(_compIdx_7, 0x19f79b1921bbcfffLL /* out */);
        _offset_20 = _out_sigIdx__2 + Fr_toInt(i)*_sigSizes_out_2[1];
        ctx->multiGetSignal(__cIdx, _compIdx_7, _offset_20, _sigValue_4, 1);
        ctx->setSignal(__cIdx, _compIdx_6, _offset_18, _sigValue_4);
        /* num2Bits1.out[i] ==> adder.in[1][i] */
        _compIdx_8 = ctx->getSubComponentOffset(__cIdx, 0x235decfdfd543243LL /* adder */);
        _in_sigIdx__6 = ctx->getSignalOffset(_compIdx_8, 0x08b73807b55c4bbeLL /* in */);
        _sigSizes_in_4 = ctx->getSignalSizes(_compIdx_8, 0x08b73807b55c4bbeLL /* in */);
        _offset_22 = _in_sigIdx__6 + 1*_sigSizes_in_4[1] + Fr_toInt(i)*_sigSizes_in_4[2];
        _compIdx_9 = ctx->getSubComponentOffset(__cIdx, 0x5c15306186c963d2LL /* num2Bits1 */);
        _out_sigIdx__3 = ctx->getSignalOffset(_compIdx_9, 0x19f79b1921bbcfffLL /* out */);
        _sigSizes_out_3 = ctx->getSignalSizes(_compIdx_9, 0x19f79b1921bbcfffLL /* out */);
        _offset_24 = _out_sigIdx__3 + Fr_toInt(i)*_sigSizes_out_3[1];
        ctx->multiGetSignal(__cIdx, _compIdx_9, _offset_24, _sigValue_5, 1);
        ctx->setSignal(__cIdx, _compIdx_8, _offset_22, _sigValue_5);
        Fr_copyn(_tmp_5, i, 1);
        Fr_add(_tmp_4, i, (ctx->circuit->constants + 1));
        Fr_copyn(i, _tmp_4, 1);
        Fr_lt(_tmp_6, i, (ctx->circuit->constants + 3));
        _loopCond = _tmp_6;
    }
    /* adder.out[n-1] ==> out */
    _compIdx_10 = ctx->getSubComponentOffset(__cIdx, 0x235decfdfd543243LL /* adder */);
    _out_sigIdx__4 = ctx->getSignalOffset(_compIdx_10, 0x19f79b1921bbcfffLL /* out */);
    _sigSizes_out_4 = ctx->getSignalSizes(_compIdx_10, 0x19f79b1921bbcfffLL /* out */);
    _offset_30 = _out_sigIdx__4 + 63*_sigSizes_out_4[1];
    ctx->multiGetSignal(__cIdx, _compIdx_10, _offset_30, _sigValue_6, 1);
    ctx->setSignal(__cIdx, __cIdx, _out_sigIdx__5, _sigValue_6);
    ctx->finished(__cIdx);
}
/*
Num2Bits
n=64
*/
void Num2Bits_986959a0f488deb8(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _tmp_1[1];
    FrElement _tmp_2[1];
    FrElement _sigValue_1[1];
    FrElement _sigValue_2[1];
    FrElement _tmp_3[1];
    FrElement _tmp_4[1];
    FrElement _sigValue_3[1];
    FrElement _tmp_6[1];
    FrElement _tmp_7[1];
    FrElement lc1[1];
    FrElement _tmp_10[1];
    FrElement i[1];
    FrElement _sigValue_4[1];
    FrElement _tmp_11[1];
    FrElement _tmp_12[1];
    FrElement _sigValue_5[1];
    FrElement _sigValue_6[1];
    FrElement _tmp_13[1];
    FrElement _tmp_14[1];
    FrElement _sigValue_7[1];
    FrElement _tmp_15[1];
    FrElement _tmp_16[1];
    FrElement _tmp_17[1];
    FrElement _tmp_19[1];
    FrElement _tmp_18[1];
    FrElement _tmp_20[1];
    FrElement _sigValue_8[1];
    int _in_sigIdx_;
    int _out_sigIdx_;
    int _offset_7;
    int _offset_9;
    int _offset_11;
    int _offset_14;
    int _offset_23;
    int _offset_25;
    int _offset_27;
    int _offset_30;
    Circom_Sizes _sigSizes_out;
    PFrElement _loopCond;
    Fr_copy(&(_tmp_10[0]), ctx->circuit->constants +1);
    Fr_copy(&(i[0]), ctx->circuit->constants +1);
    _in_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    _out_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    _sigSizes_out = ctx->getSignalSizes(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    /* signal input in */
    /* signal output out[n] */
    /* var lc1=0 */
    /* for (var i = 0;i<n;i++) */
    /* out[i] <-- (in >> i) & 1 */
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue, 1);
    Fr_shr(_tmp_1, _sigValue, (ctx->circuit->constants + 0));
    Fr_band(_tmp_2, _tmp_1, (ctx->circuit->constants + 1));
    _offset_7 = _out_sigIdx_;
    ctx->setSignal(__cIdx, __cIdx, _offset_7, _tmp_2);
    /* out[i] * (out[i] -1 ) === 0 */
    _offset_9 = _out_sigIdx_;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_9, _sigValue_1, 1);
    _offset_11 = _out_sigIdx_;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_11, _sigValue_2, 1);
    Fr_sub(_tmp_3, _sigValue_2, (ctx->circuit->constants + 1));
    Fr_mul(_tmp_4, _sigValue_1, _tmp_3);
    ctx->checkConstraint(__cIdx, _tmp_4, (ctx->circuit->constants + 0), "D:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit\zk-circuit\node_modules\circomlib\circuits\bitify.circom:31:8");
    /* lc1 += out[i] * 2**i */
    _offset_14 = _out_sigIdx_;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_14, _sigValue_3, 1);
    Fr_mul(_tmp_6, _sigValue_3, (ctx->circuit->constants + 1));
    Fr_add(_tmp_7, (ctx->circuit->constants + 0), _tmp_6);
    Fr_copyn(lc1, _tmp_7, 1);
    _loopCond = _tmp_10;
    while (Fr_isTrue(_loopCond)) {
        /* out[i] <-- (in >> i) & 1 */
        ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue_4, 1);
        Fr_shr(_tmp_11, _sigValue_4, i);
        Fr_band(_tmp_12, _tmp_11, (ctx->circuit->constants + 1));
        _offset_23 = _out_sigIdx_ + Fr_toInt(i)*_sigSizes_out[1];
        ctx->setSignal(__cIdx, __cIdx, _offset_23, _tmp_12);
        /* out[i] * (out[i] -1 ) === 0 */
        _offset_25 = _out_sigIdx_ + Fr_toInt(i)*_sigSizes_out[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_25, _sigValue_5, 1);
        _offset_27 = _out_sigIdx_ + Fr_toInt(i)*_sigSizes_out[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_27, _sigValue_6, 1);
        Fr_sub(_tmp_13, _sigValue_6, (ctx->circuit->constants + 1));
        Fr_mul(_tmp_14, _sigValue_5, _tmp_13);
        ctx->checkConstraint(__cIdx, _tmp_14, (ctx->circuit->constants + 0), "D:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit\zk-circuit\node_modules\circomlib\circuits\bitify.circom:31:8");
        /* lc1 += out[i] * 2**i */
        _offset_30 = _out_sigIdx_ + Fr_toInt(i)*_sigSizes_out[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_30, _sigValue_7, 1);
        Fr_pow(_tmp_15, (ctx->circuit->constants + 4), i);
        Fr_mul(_tmp_16, _sigValue_7, _tmp_15);
        Fr_add(_tmp_17, lc1, _tmp_16);
        Fr_copyn(lc1, _tmp_17, 1);
        Fr_copyn(_tmp_19, i, 1);
        Fr_add(_tmp_18, i, (ctx->circuit->constants + 1));
        Fr_copyn(i, _tmp_18, 1);
        Fr_lt(_tmp_20, i, (ctx->circuit->constants + 3));
        _loopCond = _tmp_20;
    }
    /* lc1 === in */
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue_8, 1);
    ctx->checkConstraint(__cIdx, lc1, _sigValue_8, "D:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit\zk-circuit\node_modules\circomlib\circuits\bitify.circom:35:4");
    ctx->finished(__cIdx);
}
/*
Num2BitsNeg
n=64
*/
void Num2BitsNeg_e1512fc1af35d0a8(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _tmp_2[1];
    FrElement neg[1];
    FrElement _tmp_4[1];
    FrElement _tmp_5[1];
    FrElement _sigValue_1[1];
    FrElement _sigValue_2[1];
    FrElement _tmp_6[1];
    FrElement _tmp_7[1];
    FrElement _sigValue_3[1];
    FrElement _tmp_9[1];
    FrElement _tmp_10[1];
    FrElement lc1[1];
    FrElement _tmp_13[1];
    FrElement i[1];
    FrElement _tmp_14[1];
    FrElement _tmp_15[1];
    FrElement _sigValue_4[1];
    FrElement _sigValue_5[1];
    FrElement _tmp_16[1];
    FrElement _tmp_17[1];
    FrElement _sigValue_6[1];
    FrElement _tmp_18[1];
    FrElement _tmp_19[1];
    FrElement _tmp_20[1];
    FrElement _tmp_22[1];
    FrElement _tmp_21[1];
    FrElement _tmp_23[1];
    FrElement _sigValue_7[1];
    FrElement _sigValue_8[1];
    FrElement _tmp_25[1];
    FrElement _tmp_26[1];
    FrElement _sigValue_9[1];
    FrElement _tmp_28[1];
    int _in_sigIdx_;
    int _out_sigIdx_;
    int _offset_11;
    int _offset_13;
    int _offset_15;
    int _offset_18;
    int _offset_28;
    int _offset_30;
    int _offset_32;
    int _offset_35;
    int _compIdx;
    int _in_sigIdx__1;
    int _compIdx_1;
    int _out_sigIdx__1;
    Circom_Sizes _sigSizes_out;
    PFrElement _loopCond;
    Fr_copy(&(_tmp_13[0]), ctx->circuit->constants +1);
    Fr_copy(&(i[0]), ctx->circuit->constants +1);
    _in_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    _out_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    _sigSizes_out = ctx->getSignalSizes(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    /* signal input in */
    /* signal output out[n] */
    /* var lc1=0 */
    /* component isZero */
    /* isZero = IsZero() */
    /* var neg = n == 0 ? 0 : 2**n - in */
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue, 1);
    Fr_sub(_tmp_2, (ctx->circuit->constants + 5), _sigValue);
    Fr_copyn(neg, _tmp_2, 1);
    /* for (var i = 0;i<n;i++) */
    /* out[i] <-- (neg >> i) & 1 */
    Fr_shr(_tmp_4, neg, (ctx->circuit->constants + 0));
    Fr_band(_tmp_5, _tmp_4, (ctx->circuit->constants + 1));
    _offset_11 = _out_sigIdx_;
    ctx->setSignal(__cIdx, __cIdx, _offset_11, _tmp_5);
    /* out[i] * (out[i] -1 ) === 0 */
    _offset_13 = _out_sigIdx_;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_13, _sigValue_1, 1);
    _offset_15 = _out_sigIdx_;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_15, _sigValue_2, 1);
    Fr_sub(_tmp_6, _sigValue_2, (ctx->circuit->constants + 1));
    Fr_mul(_tmp_7, _sigValue_1, _tmp_6);
    ctx->checkConstraint(__cIdx, _tmp_7, (ctx->circuit->constants + 0), "D:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit\zk-circuit\node_modules\circomlib\circuits\bitify.circom:92:8");
    /* lc1 += out[i] * 2**i */
    _offset_18 = _out_sigIdx_;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_18, _sigValue_3, 1);
    Fr_mul(_tmp_9, _sigValue_3, (ctx->circuit->constants + 1));
    Fr_add(_tmp_10, (ctx->circuit->constants + 0), _tmp_9);
    Fr_copyn(lc1, _tmp_10, 1);
    _loopCond = _tmp_13;
    while (Fr_isTrue(_loopCond)) {
        /* out[i] <-- (neg >> i) & 1 */
        Fr_shr(_tmp_14, neg, i);
        Fr_band(_tmp_15, _tmp_14, (ctx->circuit->constants + 1));
        _offset_28 = _out_sigIdx_ + Fr_toInt(i)*_sigSizes_out[1];
        ctx->setSignal(__cIdx, __cIdx, _offset_28, _tmp_15);
        /* out[i] * (out[i] -1 ) === 0 */
        _offset_30 = _out_sigIdx_ + Fr_toInt(i)*_sigSizes_out[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_30, _sigValue_4, 1);
        _offset_32 = _out_sigIdx_ + Fr_toInt(i)*_sigSizes_out[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_32, _sigValue_5, 1);
        Fr_sub(_tmp_16, _sigValue_5, (ctx->circuit->constants + 1));
        Fr_mul(_tmp_17, _sigValue_4, _tmp_16);
        ctx->checkConstraint(__cIdx, _tmp_17, (ctx->circuit->constants + 0), "D:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit\zk-circuit\node_modules\circomlib\circuits\bitify.circom:92:8");
        /* lc1 += out[i] * 2**i */
        _offset_35 = _out_sigIdx_ + Fr_toInt(i)*_sigSizes_out[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_35, _sigValue_6, 1);
        Fr_pow(_tmp_18, (ctx->circuit->constants + 4), i);
        Fr_mul(_tmp_19, _sigValue_6, _tmp_18);
        Fr_add(_tmp_20, lc1, _tmp_19);
        Fr_copyn(lc1, _tmp_20, 1);
        Fr_copyn(_tmp_22, i, 1);
        Fr_add(_tmp_21, i, (ctx->circuit->constants + 1));
        Fr_copyn(i, _tmp_21, 1);
        Fr_lt(_tmp_23, i, (ctx->circuit->constants + 3));
        _loopCond = _tmp_23;
    }
    /* in ==> isZero.in */
    _compIdx = ctx->getSubComponentOffset(__cIdx, 0xd00dafe9dde3ed53LL /* isZero */);
    _in_sigIdx__1 = ctx->getSignalOffset(_compIdx, 0x08b73807b55c4bbeLL /* in */);
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue_7, 1);
    ctx->setSignal(__cIdx, _compIdx, _in_sigIdx__1, _sigValue_7);
    /* lc1 + isZero.out * 2**n === 2**n - in */
    _compIdx_1 = ctx->getSubComponentOffset(__cIdx, 0xd00dafe9dde3ed53LL /* isZero */);
    _out_sigIdx__1 = ctx->getSignalOffset(_compIdx_1, 0x19f79b1921bbcfffLL /* out */);
    ctx->multiGetSignal(__cIdx, _compIdx_1, _out_sigIdx__1, _sigValue_8, 1);
    Fr_mul(_tmp_25, _sigValue_8, (ctx->circuit->constants + 5));
    Fr_add(_tmp_26, lc1, _tmp_25);
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue_9, 1);
    Fr_sub(_tmp_28, (ctx->circuit->constants + 5), _sigValue_9);
    ctx->checkConstraint(__cIdx, _tmp_26, _tmp_28, "D:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit\zk-circuit\node_modules\circomlib\circuits\bitify.circom:100:4");
    ctx->finished(__cIdx);
}
/*
BinSum
n=64
ops=2
*/
void BinSum_aa7bc2cf353b13cb(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _tmp_6[1];
    FrElement _tmp_7[1];
    FrElement lin[1];
    FrElement _tmp_10[1];
    FrElement j[1];
    FrElement _sigValue_1[1];
    FrElement _tmp_12[1];
    FrElement _tmp_13[1];
    FrElement _tmp_15[1];
    FrElement _tmp_14[1];
    FrElement _tmp_16[1];
    FrElement _tmp_19[1];
    FrElement k[1];
    FrElement _num_8[1];
    FrElement _tmp_20[1];
    FrElement _sigValue_2[1];
    FrElement _tmp_21[1];
    FrElement _tmp_22[1];
    FrElement _tmp_23[1];
    FrElement _tmp_25[1];
    FrElement _tmp_24[1];
    FrElement _tmp_26[1];
    FrElement _tmp_28[1];
    FrElement _tmp_27[1];
    FrElement _tmp_29[1];
    FrElement _num_10[1];
    FrElement _tmp_30[1];
    FrElement lout[1];
    FrElement _tmp_31[1];
    FrElement _tmp_32[1];
    FrElement _sigValue_3[1];
    FrElement _sigValue_4[1];
    FrElement _tmp_33[1];
    FrElement _tmp_34[1];
    FrElement _sigValue_5[1];
    FrElement _tmp_35[1];
    FrElement _tmp_36[1];
    FrElement _tmp_37[1];
    FrElement _tmp_39[1];
    FrElement _tmp_38[1];
    FrElement _tmp_40[1];
    int _in_sigIdx_;
    int _offset_17;
    int _offset_27;
    int _offset_44;
    int _out_sigIdx_;
    int _offset_61;
    int _offset_63;
    int _offset_65;
    int _offset_68;
    Circom_Sizes _sigSizes_in;
    Circom_Sizes _sigSizes_out;
    PFrElement _loopCond;
    PFrElement _loopCond_1;
    PFrElement _loopCond_2;
    PFrElement _loopCond_3;
    Fr_copy(&(_tmp_10[0]), ctx->circuit->constants +1);
    Fr_copy(&(j[0]), ctx->circuit->constants +1);
    Fr_copy(&(_tmp_19[0]), ctx->circuit->constants +1);
    Fr_copy(&(k[0]), ctx->circuit->constants +1);
    Fr_copy(&(_num_8[0]), ctx->circuit->constants +0);
    Fr_copy(&(_num_10[0]), ctx->circuit->constants +0);
    Fr_copy(&(lout[0]), ctx->circuit->constants +0);
    _in_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    _out_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    _sigSizes_in = ctx->getSignalSizes(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_out = ctx->getSignalSizes(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    /* var nout = nbits((2**n -1)*ops) */
    /* signal input in[ops][n] */
    /* signal output out[nout] */
    /* var lin = 0 */
    /* var lout = 0 */
    /* var k */
    /* var j */
    /* for (k=0;k<n;k++) */
    /* for (j=0;j<ops;j++) */
    /* lin += in[j][k] * 2**k */
    _offset_17 = _in_sigIdx_;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_17, _sigValue, 1);
    Fr_mul(_tmp_6, _sigValue, (ctx->circuit->constants + 1));
    Fr_add(_tmp_7, (ctx->circuit->constants + 0), _tmp_6);
    Fr_copyn(lin, _tmp_7, 1);
    _loopCond = _tmp_10;
    while (Fr_isTrue(_loopCond)) {
        /* lin += in[j][k] * 2**k */
        _offset_27 = _in_sigIdx_ + Fr_toInt(j)*_sigSizes_in[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_27, _sigValue_1, 1);
        Fr_mul(_tmp_12, _sigValue_1, (ctx->circuit->constants + 1));
        Fr_add(_tmp_13, lin, _tmp_12);
        Fr_copyn(lin, _tmp_13, 1);
        Fr_copyn(_tmp_15, j, 1);
        Fr_add(_tmp_14, j, (ctx->circuit->constants + 1));
        Fr_copyn(j, _tmp_14, 1);
        Fr_lt(_tmp_16, j, (ctx->circuit->constants + 4));
        _loopCond = _tmp_16;
    }
    _loopCond_1 = _tmp_19;
    while (Fr_isTrue(_loopCond_1)) {
        /* for (j=0;j<ops;j++) */
        Fr_copyn(j, _num_8, 1);
        Fr_lt(_tmp_20, j, (ctx->circuit->constants + 4));
        _loopCond_2 = _tmp_20;
        while (Fr_isTrue(_loopCond_2)) {
            /* lin += in[j][k] * 2**k */
            _offset_44 = _in_sigIdx_ + Fr_toInt(j)*_sigSizes_in[1] + Fr_toInt(k)*_sigSizes_in[2];
            ctx->multiGetSignal(__cIdx, __cIdx, _offset_44, _sigValue_2, 1);
            Fr_pow(_tmp_21, (ctx->circuit->constants + 4), k);
            Fr_mul(_tmp_22, _sigValue_2, _tmp_21);
            Fr_add(_tmp_23, lin, _tmp_22);
            Fr_copyn(lin, _tmp_23, 1);
            Fr_copyn(_tmp_25, j, 1);
            Fr_add(_tmp_24, j, (ctx->circuit->constants + 1));
            Fr_copyn(j, _tmp_24, 1);
            Fr_lt(_tmp_26, j, (ctx->circuit->constants + 4));
            _loopCond_2 = _tmp_26;
        }
        Fr_copyn(_tmp_28, k, 1);
        Fr_add(_tmp_27, k, (ctx->circuit->constants + 1));
        Fr_copyn(k, _tmp_27, 1);
        Fr_lt(_tmp_29, k, (ctx->circuit->constants + 3));
        _loopCond_1 = _tmp_29;
    }
    /* for (k=0;k<nout;k++) */
    Fr_copyn(k, _num_10, 1);
    Fr_lt(_tmp_30, k, (ctx->circuit->constants + 6));
    _loopCond_3 = _tmp_30;
    while (Fr_isTrue(_loopCond_3)) {
        /* out[k] <-- (lin >> k) & 1 */
        Fr_shr(_tmp_31, lin, k);
        Fr_band(_tmp_32, _tmp_31, (ctx->circuit->constants + 1));
        _offset_61 = _out_sigIdx_ + Fr_toInt(k)*_sigSizes_out[1];
        ctx->setSignal(__cIdx, __cIdx, _offset_61, _tmp_32);
        /* out[k] * (out[k] - 1) === 0 */
        _offset_63 = _out_sigIdx_ + Fr_toInt(k)*_sigSizes_out[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_63, _sigValue_3, 1);
        _offset_65 = _out_sigIdx_ + Fr_toInt(k)*_sigSizes_out[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_65, _sigValue_4, 1);
        Fr_sub(_tmp_33, _sigValue_4, (ctx->circuit->constants + 1));
        Fr_mul(_tmp_34, _sigValue_3, _tmp_33);
        ctx->checkConstraint(__cIdx, _tmp_34, (ctx->circuit->constants + 0), "D:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit\zk-circuit\node_modules\circomlib\circuits\binsum.circom:85:8");
        /* lout += out[k] * 2**k */
        _offset_68 = _out_sigIdx_ + Fr_toInt(k)*_sigSizes_out[1];
        ctx->multiGetSignal(__cIdx, __cIdx, _offset_68, _sigValue_5, 1);
        Fr_pow(_tmp_35, (ctx->circuit->constants + 4), k);
        Fr_mul(_tmp_36, _sigValue_5, _tmp_35);
        Fr_add(_tmp_37, lout, _tmp_36);
        Fr_copyn(lout, _tmp_37, 1);
        Fr_copyn(_tmp_39, k, 1);
        Fr_add(_tmp_38, k, (ctx->circuit->constants + 1));
        Fr_copyn(k, _tmp_38, 1);
        Fr_lt(_tmp_40, k, (ctx->circuit->constants + 6));
        _loopCond_3 = _tmp_40;
    }
    /* lin === lout */
    ctx->checkConstraint(__cIdx, lin, lout, "D:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit\zk-circuit\node_modules\circomlib\circuits\binsum.circom:92:4");
    ctx->finished(__cIdx);
}
/*
IsZero
*/
void IsZero_0a2b8515b81b5ef3(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _tmp[1];
    FrElement _sigValue_1[1];
    FrElement _tmp_1[1];
    FrElement _sigValue_2[1];
    FrElement _tmp_2[1];
    FrElement _sigValue_3[1];
    FrElement _tmp_3[1];
    FrElement _tmp_4[1];
    FrElement _sigValue_4[1];
    FrElement _sigValue_5[1];
    FrElement _tmp_5[1];
    int _in_sigIdx_;
    int _inv_sigIdx_;
    int _out_sigIdx_;
    PFrElement _ter;
    _in_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    _inv_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x2b9ffd192bd4c4d8LL /* inv */);
    _out_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    /* signal input in */
    /* signal output out */
    /* signal inv */
    /* inv <-- in!=0 ? 1/in : 0 */
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue, 1);
    Fr_neq(_tmp, _sigValue, (ctx->circuit->constants + 0));
    if (Fr_isTrue(_tmp)) {
        ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue_1, 1);
        Fr_div(_tmp_1, (ctx->circuit->constants + 1), _sigValue_1);
        _ter = _tmp_1;
    } else {
        _ter = (ctx->circuit->constants + 0);
    }
    ctx->setSignal(__cIdx, __cIdx, _inv_sigIdx_, _ter);
    /* out <== -in*inv +1 */
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue_2, 1);
    Fr_neg(_tmp_2, _sigValue_2);
    ctx->multiGetSignal(__cIdx, __cIdx, _inv_sigIdx_, _sigValue_3, 1);
    Fr_mul(_tmp_3, _tmp_2, _sigValue_3);
    Fr_add(_tmp_4, _tmp_3, (ctx->circuit->constants + 1));
    ctx->setSignal(__cIdx, __cIdx, _out_sigIdx_, _tmp_4);
    /* in*out === 0 */
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue_4, 1);
    ctx->multiGetSignal(__cIdx, __cIdx, _out_sigIdx_, _sigValue_5, 1);
    Fr_mul(_tmp_5, _sigValue_4, _sigValue_5);
    ctx->checkConstraint(__cIdx, _tmp_5, (ctx->circuit->constants + 0), "D:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit\zk-circuit\node_modules\circomlib\circuits\comparators.circom:32:4");
    ctx->finished(__cIdx);
}
/*
AND
*/
void AND_fa069719a050be66(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _sigValue_1[1];
    FrElement _tmp[1];
    int _a_sigIdx_;
    int _b_sigIdx_;
    int _out_sigIdx_;
    _a_sigIdx_ = ctx->getSignalOffset(__cIdx, 0xaf63dc4c8601ec8cLL /* a */);
    _b_sigIdx_ = ctx->getSignalOffset(__cIdx, 0xaf63df4c8601f1a5LL /* b */);
    _out_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    /* signal input a */
    /* signal input b */
    /* signal output out */
    /* out <== a*b */
    ctx->multiGetSignal(__cIdx, __cIdx, _a_sigIdx_, _sigValue, 1);
    ctx->multiGetSignal(__cIdx, __cIdx, _b_sigIdx_, _sigValue_1, 1);
    Fr_mul(_tmp, _sigValue, _sigValue_1);
    ctx->setSignal(__cIdx, __cIdx, _out_sigIdx_, _tmp);
    ctx->finished(__cIdx);
}
// Function Table
Circom_ComponentFunction _functionTable[8] = {
     CreditCheck_ad690d6bdf5dff0c
    ,GreaterEqThan_839c44f336a05c65
    ,LessThan_eba45112d4d3a1ec
    ,Num2Bits_986959a0f488deb8
    ,Num2BitsNeg_e1512fc1af35d0a8
    ,BinSum_aa7bc2cf353b13cb
    ,IsZero_0a2b8515b81b5ef3
    ,AND_fa069719a050be66
};
