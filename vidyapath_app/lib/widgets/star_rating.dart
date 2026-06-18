import 'package:flutter/material.dart';
import '../../config/theme.dart';

class StarRating extends StatelessWidget {
  final double rating;
  final double size;
  final bool interactive;
  final void Function(int)? onChanged;
  final Color? activeColor;

  const StarRating({
    super.key,
    required this.rating,
    this.size = 20,
    this.interactive = false,
    this.onChanged,
    this.activeColor,
  });

  @override
  Widget build(BuildContext context) {
    final gold = activeColor ?? KushaagraTheme.accentGold;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        final starValue = i + 1;
        final filled = rating >= starValue;
        final half = !filled && rating >= starValue - 0.5;
        return GestureDetector(
          onTap: interactive ? () => onChanged?.call(starValue) : null,
          child: AnimatedScale(
            scale: filled ? 1.1 : 1.0,
            duration: const Duration(milliseconds: 200),
            child: Icon(
              filled ? Icons.star : half ? Icons.star_half : Icons.star_border,
              size: size,
              color: gold,
            ),
          ),
        );
      }),
    );
  }
}
