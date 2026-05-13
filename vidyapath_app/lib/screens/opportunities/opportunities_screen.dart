import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../providers/data_providers.dart';
import '../../models/opportunity.dart';
import '../../widgets/glass_widgets.dart';

class OpportunitiesScreen extends ConsumerStatefulWidget {
  const OpportunitiesScreen({super.key});
  @override
  ConsumerState<OpportunitiesScreen> createState() => _OpportunitiesScreenState();
}

class _OpportunitiesScreenState extends ConsumerState<OpportunitiesScreen> with SingleTickerProviderStateMixin {
  final _searchController = TextEditingController();
  Timer? _debounce;
  String? _selectedType;
  String? _selectedCategory;
  final _scrollController = ScrollController();

  late TabController _tabController;
  final _types = [null, 'scholarship', 'competition', 'scheme'];
  final _typeLabels = ['All', 'Scholarships', 'Competitions', 'Schemes'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {
          _selectedType = _types[_tabController.index];
          _selectedCategory = null;
        });
        ref.read(selectedCategoryProvider.notifier).set(null);
        _fetchData();
      }
    });
    _scrollController.addListener(_onScroll);
    
    // Initial fetch
    Future.microtask(() {
      final provCategory = ref.read(selectedCategoryProvider);
      final provType = ref.read(selectedTypeProvider);
      
      if (provCategory != null) {
        setState(() => _selectedCategory = provCategory);
      }
      if (provType != null) {
        setState(() {
          _selectedType = provType;
          _tabController.index = _types.indexOf(provType);
        });
      }
      _fetchData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    _tabController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _fetchData({bool refresh = false}) {
    ref.read(opportunitiesProvider.notifier).fetchOpportunities(
      type: _selectedType,
      category: _selectedCategory,
      search: _searchController.text.isNotEmpty ? _searchController.text : null,
      page: refresh ? 1 : 1,
      refresh: refresh,
    );
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      final state = ref.read(opportunitiesProvider);
      if (!state.isLoading && state.items.length < state.total) {
        ref.read(opportunitiesProvider.notifier).fetchOpportunities(
          type: _selectedType,
          category: _selectedCategory,
          search: _searchController.text.isNotEmpty ? _searchController.text : null,
          page: state.page + 1,
        );
      }
    }
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () => _fetchData(refresh: true));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(opportunitiesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Listen for external category changes (e.g. from Home Screen)
    ref.listen(selectedCategoryProvider, (previous, next) {
      if (next != _selectedCategory) {
        setState(() => _selectedCategory = next);
        _fetchData(refresh: true);
      }
    });

    // Listen for external type changes (e.g. from Home Screen)
    ref.listen(selectedTypeProvider, (previous, next) {
      if (next != _selectedType) {
        setState(() {
          _selectedType = next;
          _tabController.index = _types.indexOf(next);
        });
        _fetchData(refresh: true);
      }
    });

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFF8FAFC), const Color(0xFFEFF6FF)],
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: Column(
            children: [
              // ─── Search Bar ───
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                child: GlassCard(
                  padding: EdgeInsets.zero,
                  child: TextField(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    decoration: InputDecoration(
                      hintText: 'Search scholarships, competitions...',
                      prefixIcon: Icon(Icons.search_rounded, color: Theme.of(context).colorScheme.primary),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 20),
                              onPressed: () {
                                _searchController.clear();
                                _fetchData(refresh: true);
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                  ),
                ),
              ).animate().fadeIn().slideY(begin: -0.15),

              if (_selectedCategory != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 4, 20, 10),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: [
                            KushaagraTheme.primaryBlue.withValues(alpha: 0.15),
                            KushaagraTheme.primaryBlue.withValues(alpha: 0.05),
                          ]),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: KushaagraTheme.primaryBlue.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.filter_list_rounded, size: 14, color: KushaagraTheme.primaryBlue),
                            const SizedBox(width: 8),
                            Text('Viewing $_selectedCategory', 
                              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800, color: KushaagraTheme.primaryBlue)
                            ),
                            const SizedBox(width: 10),
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedCategory = null;
                                  _selectedType = null;
                                  _tabController.index = 0;
                                });
                                ref.read(selectedCategoryProvider.notifier).set(null);
                                ref.read(selectedTypeProvider.notifier).set(null);
                                _fetchData(refresh: true);
                              },
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(color: KushaagraTheme.primaryBlue, shape: BoxShape.circle),
                                child: const Icon(Icons.close_rounded, size: 12, color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                      ).animate().fadeIn().scale(curve: Curves.easeOutBack),
                    ],
                  ),
                ),

              // ─── Type Tabs ───
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: TabBar(
                  controller: _tabController,
                  isScrollable: false,
                  indicatorSize: TabBarIndicatorSize.tab,
                  indicator: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: BorderRadius.circular(KushaagraTheme.radiusFull),
                  ),
                  labelColor: Colors.white,
                  unselectedLabelColor: Theme.of(context).colorScheme.onSurfaceVariant,
                  labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  unselectedLabelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w400),
                  dividerColor: Colors.transparent,
                  tabs: _typeLabels.map((l) => Tab(text: l, height: 36)).toList(),
                ),
              ).animate().fadeIn(delay: 100.ms),

              const SizedBox(height: 8),

              // ─── Category Chips ───
              SizedBox(
                height: 38,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    _categoryChip(null, 'All'),
                    _categoryChip('academic', '📚 Academic'),
                    _categoryChip('coding', '💻 Coding'),
                    _categoryChip('arts', '🎨 Arts'),
                    _categoryChip('science', '🔬 Science'),
                    _categoryChip('quiz', '❓ Quiz'),
                    _categoryChip('writing', '✍️ Writing'),
                  ],
                ),
              ).animate().fadeIn(delay: 150.ms),

              const SizedBox(height: 8),

              // ─── Results ───
              Expanded(
                child: state.isLoading && state.items.isEmpty
                    ? _buildLoadingSkeleton()
                    : state.items.isEmpty
                        ? const EmptyState(
                            icon: Icons.search_off_rounded,
                            title: 'No Opportunities Found',
                            subtitle: 'Try adjusting your search or filters',
                          )
                        : RefreshIndicator(
                            onRefresh: () async => _fetchData(refresh: true),
                            child: ListView.separated(
                              controller: _scrollController,
                              padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                              itemCount: state.items.length + (state.isLoading ? 1 : 0),
                              separatorBuilder: (_, __) => const SizedBox(height: 12),
                              itemBuilder: (_, i) {
                                if (i >= state.items.length) {
                                  return const Center(child: Padding(
                                    padding: EdgeInsets.all(16),
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  ));
                                }
                                return _opportunityCard(state.items[i], i);
                              },
                            ),
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _categoryChip(String? value, String label) {
    final isSelected = _selectedCategory == value;
    final color = isSelected ? Theme.of(context).colorScheme.primary : Colors.transparent;
    
    return Padding(
      padding: const EdgeInsets.only(right: 10),
      child: ChoiceChip(
        selected: isSelected,
        label: Text(label),
        onSelected: (_) {
          setState(() => _selectedCategory = value);
          _fetchData(refresh: true);
        },
        selectedColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.15),
        backgroundColor: Colors.white.withValues(alpha: 0.05),
        labelStyle: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
          color: isSelected ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.onSurfaceVariant,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: isSelected ? color : Colors.white.withValues(alpha: 0.1)),
        ),
        showCheckmark: false,
      ),
    );
  }

  Widget _opportunityCard(OpportunityModel opp, int index) {
    final cardColor = opp.type == 'scholarship' ? const Color(0xFF6366F1) : const Color(0xFFF59E0B);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
        boxShadow: [
          BoxShadow(
            color: cardColor.withValues(alpha: 0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: GlassCard(
        onTap: () => Navigator.pushNamed(context, '/opportunity', arguments: opp.id),
        padding: const EdgeInsets.all(18),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            cardColor.withValues(alpha: 0.1),
            Colors.transparent,
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Type badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: cardColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: cardColor.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    children: [
                      Text(opp.typeEmoji, style: const TextStyle(fontSize: 14)),
                      const SizedBox(width: 6),
                      Text(
                        opp.typeLabel.toUpperCase(),
                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: cardColor, letterSpacing: 0.5)
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                if (opp.organizer?.level != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(opp.organizer!.levelLabel, style: KushaagraTheme.bodySmall(context).copyWith(fontSize: 10, fontWeight: FontWeight.w700)),
                  ),
                const Spacer(),
                if (opp.matchScore != null)
                  MatchScoreRing(score: opp.matchScore!, size: 42, strokeWidth: 4),
              ],
            ),
            const SizedBox(height: 16),

            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(opp.title, 
                        style: KushaagraTheme.titleLarge(context).copyWith(fontSize: 18, fontWeight: FontWeight.w800, height: 1.3), 
                        maxLines: 2, 
                        overflow: TextOverflow.ellipsis
                      ),
                      const SizedBox(height: 6),
                      Text(opp.organizer?.name ?? '', 
                        style: KushaagraTheme.bodyMedium(context).copyWith(color: Colors.grey, fontWeight: FontWeight.w600)
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                // Premium "Go" Arrow Button
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: cardColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                    border: Border.all(color: cardColor.withValues(alpha: 0.2)),
                  ),
                  child: Icon(Icons.arrow_forward_ios_rounded, size: 18, color: cardColor),
                ).animate(onPlay: (c) => c.repeat(reverse: true))
                 .moveX(begin: 0, end: 4, duration: 1.seconds, curve: Curves.easeInOut),
              ],
            ),

            const SizedBox(height: 18),

            // Bottom row — reward + deadline
            Row(
              children: [
                if (opp.rewards?.cashAmount != null && opp.rewards!.cashAmount! > 0)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      gradient: KushaagraTheme.goldGradient,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(color: Colors.amber.withValues(alpha: 0.2), blurRadius: 10),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.stars_rounded, size: 16, color: Colors.white),
                        const SizedBox(width: 6),
                        Text(opp.rewards!.displayAmount, 
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white)
                        ),
                      ],
                    ),
                  ),
                if (opp.application?.isFree == true) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: KushaagraTheme.success.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text('FREE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: KushaagraTheme.success)),
                  ),
                ],
                const Spacer(),
                if (opp.daysLeft >= 0) DeadlineChip(daysLeft: opp.daysLeft),
              ],
            ),
          ],
        ),
      ),
    ).animate(delay: Duration(milliseconds: 60 * (index % 10)))
     .fadeIn(duration: 400.ms)
     .slideY(begin: 0.1, curve: Curves.easeOutBack);
  }

  Widget _buildLoadingSkeleton() {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
      itemCount: 5,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, __) => const ShimmerBox(width: double.infinity, height: 140, borderRadius: 20),
    );
  }
}
