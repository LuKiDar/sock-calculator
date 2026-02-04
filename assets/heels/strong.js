export const strongHeel = {
  id: "strong",
  title: "Strong heel (reinforced flap)",
  buildDetails(sockSts) {
    const heelFlapSts = sockSts / 2;
    const heelFlapRows = heelFlapSts;
    const gussetStsEachSide = heelFlapRows / 2;
    return {
      items: [
        `Heel flap stitches: ${heelFlapSts}`,
        `Heel flap rows: ${heelFlapRows}`,
        `Gusset pickup per side: ${gussetStsEachSide}`,
        `Total gusset addition: ${gussetStsEachSide * 2}`,
      ],
      note: "Same shaping as square heel with a slipped-stitch flap.",
      instructions: [
        "Work reinforced heel flap (slipped-stitch pattern).",
        "Turn the heel over the flap stitches.",
        "Pick up gusset stitches along flap edges.",
        "Decrease gusset back to sock stitch count.",
      ],
    };
  },
};
